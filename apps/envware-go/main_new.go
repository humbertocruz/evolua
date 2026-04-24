package main

import (
	"bufio"
	"bytes"
	"crypto"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/fatih/color"
	"golang.org/x/crypto/scrypt"
)

// ============================================
// CONSTANTS & CONFIG
// ============================================

const (
	Version         = "3.0.0"
	APIBaseURL      = "https://envware.com/api/v2"
	EnvFilePrefix   = ".env"
	CryptoFileName  = ".env.crypto"
)

// Environment files to process
var EnvFiles = []string{
	".env",
	".env.development",
	".env.production",
	".env.test",
	".env.local",
}

// Role hierarchy (higher index = more permissions)
var RoleLevel = map[string]int{
	"owner":  4,
	"admin":  3,
	"dev":    2,
	"test":   1,
}

// ============================================
// STRUCTS
// ============================================

type SSHKeys struct {
	PrivateKey string
	PublicKey  string
	Fingerprint string
}

type ChallengeRequest struct {
	PublicKey string `json:"publicKey"`
}
type ChallengeResponse struct {
	Challenge string `json:"challenge"`
}

type AccessRequest struct {
	PublicKey   string `json:"publicKey"`
	Signature   string `json:"signature"`
	TeamSlug    string `json:"teamSlug"`
	ProjectSlug string `json:"projectSlug"`
	Role        string `json:"role"`
	UserName    string `json:"userName"`
	DeviceAlias string `json:"deviceAlias"`
}

type StatusRequest struct {
	PublicKey   string `json:"publicKey"`
	Signature   string `json:"signature"`
	TeamSlug    string `json:"teamSlug"`
	ProjectSlug string `json:"projectSlug,omitempty"`
}

type Secret struct {
	K    string `json:"k"`   // Encrypted Key
	V    string `json:"v"`   // Encrypted Value
	IvK  string `json:"ik"`  // IV for Key
	IvV  string `json:"iv"`  // IV for Value
	Tag  string `json:"tag"` // Auth Tag (Value)
	TagK string `json:"tk"`  // Auth Tag (Key)
}

type PushRequest struct {
	PublicKey           string   `json:"publicKey"`
	Signature           string   `json:"signature"`
	TeamSlug            string   `json:"teamSlug"`
	ProjectSlug         string   `json:"projectSlug"`
	Environment         string   `json:"environment"`
	Secrets             []Secret `json:"secrets"`
	EncryptedProjectKey string   `json:"encryptedProjectKey,omitempty"`
}

type PullRequest struct {
	PublicKey   string `json:"publicKey"`
	Signature   string `json:"signature"`
	TeamSlug    string `json:"teamSlug"`
	ProjectSlug string `json:"projectSlug"`
	Environment string `json:"environment"`
}

type ApproveRequest struct {
	PublicKey           string `json:"publicKey"`
	Signature           string `json:"signature"`
	RequestId           string `json:"requestId,omitempty"`
	EncryptedProjectKey string `json:"encryptedProjectKey"`
	TeamSlug            string `json:"teamSlug,omitempty"`
	ProjectSlug         string `json:"projectSlug,omitempty"`
}

type EnvInfo struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type ProjectListItem struct {
	Name         string `json:"name"`
	Slug         string `json:"slug"`
	EnvCount     int    `json:"envCount"`
	Role         string `json:"role"`
	RepoURL      string `json:"repoUrl,omitempty"`
}

type TeamInfo struct {
	Name    string            `json:"name"`
	Slug    string            `json:"slug"`
	Projects []ProjectListItem `json:"projects"`
}

type UserStatus struct {
	Fingerprint string      `json:"fingerprint"`
	Teams       []TeamInfo  `json:"teams"`
	Billing     *BillingInfo `json:"billing,omitempty"`
	IsOwner     bool        `json:"isOwner"`
}

type BillingInfo struct {
	TeamsUsed    int `json:"teamsUsed"`
	TeamsLimit  int `json:"teamsLimit"`
	ProjectsUsed int `json:"projectsUsed"`
	ProjectsLimit int `json:"projectsLimit"`
	UsersUsed    int `json:"usersUsed"`
	UsersLimit   int `json:"usersLimit"`
}

type RequestResponse struct {
	Success      bool   `json:"success"`
	Message      string `json:"message"`
	Fingerprint  string `json:"fingerprint,omitempty"`
	RequestId    string `json:"requestId,omitempty"`
	URL          string `json:"url,omitempty"`
	TeamSlug     string `json:"teamSlug,omitempty"`
	ProjectSlug  string `json:"projectSlug,omitempty"`
	ProjectName  string `json:"projectName,omitempty"`
	LimitReached string `json:"limitReached,omitempty"`
}

// ============================================
// MAIN
// ============================================

func main() {
	color.New(color.FgCyan, color.Bold).Println("🌸 git-envware CLI v" + Version)

	// Check if running under git
	isGitMode := isRunningUnderGit()

	if len(os.Args) < 2 {
		showUsage(isGitMode)
		return
	}

	action := os.Args[1]

	// Handle git- prefix (running as git envware)
	if isGitMode {
		switch action {
		case "init", "push", "pull", "request", "accept", "status", "team", "buy", "remove":
			// Valid commands, continue
		default:
			color.Red("Unknown command: %s", action)
			showUsage(true)
			return
		}
	}

	// Get SSH keys
	service := NewEnvwareService()
	privStr, pubStr, err := service.GetSSHKeys()
	if err != nil {
		color.Red("Error loading keys: %v", err)
		return
	}

	// Parse private key
	pemBlock, _ := pem.Decode([]byte(privStr))
	var privKey *rsa.PrivateKey
	if key, err := x509.ParsePKCS1PrivateKey(pemBlock.Bytes); err == nil {
		privKey = key
	} else {
		pk8, _ := x509.ParsePKCS8PrivateKey(pemBlock.Bytes)
		privKey = pk8.(*rsa.PrivateKey)
	}

	switch action {
	// ============================================
	// INIT: Setup project in current git repo
	// ============================================
	case "init":
		handleInit(service, privKey, pubStr, isGitMode)

	// ============================================
	// PUSH: Encrypt and sync secrets
	// ============================================
	case "push":
		handlePush(service, privKey, pubStr, isGitMode)

	// ============================================
	// PULL: Sync and decrypt secrets
	// ============================================
	case "pull":
		handlePull(service, privKey, pubStr, isGitMode)

	// ============================================
	// REQUEST: Request access to project
	// ============================================
	case "request":
		handleRequest(service, privKey, pubStr)

	// ============================================
	// ACCEPT: Approve access request
	// ============================================
	case "accept":
		handleAccept(service, privKey, pubStr)

	// ============================================
	// STATUS: Show current status
	// ============================================
	case "status":
		handleStatus(service, privKey, pubStr)

	// ============================================
	// TEAM: Manage teams
	// ============================================
	case "team":
		handleTeam(service, privKey, pubStr)

	// ============================================
	// BUY: Purchase packs
	// ============================================
	case "buy":
		handleBuy(service, privKey, pubStr)

	// ============================================
	// REMOVE: Remove team/project/user
	// ============================================
	case "remove":
		handleRemove(service, privKey, pubStr)

	// ============================================
	// HELP & VERSION
	// ============================================
	case "help":
		showUsage(isGitMode)
	case "version":
		color.Green("git-envware CLI v%s", Version)
	default:
		color.Red("Unknown command: %s", action)
		showUsage(isGitMode)
	}
}

// ============================================
// GIT DETECTION
// ============================================

func isRunningUnderGit() bool {
	binaryName := filepath.Base(os.Args[0])
	return strings.HasPrefix(binaryName, "git-") && os.Getenv("ENVW_INTERNAL") != "true"
}

func getGitRemote() (string, error) {
	// Check if in git repo
	cmd := exec.Command("git", "rev-parse", "--git-dir")
	cmd.Dir, _ = os.Getwd()
	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("not a git repository")
	}

	// Get remote URL
	cmd = exec.Command("git", "remote", "get-url", "origin")
	cmd.Dir, _ = os.Getwd()
	out, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("no remote origin configured")
	}

	return strings.TrimSpace(string(out)), nil
}

func isGitRepo() bool {
	cmd := exec.Command("git", "rev-parse", "--git-dir")
	cmd.Dir, _ = os.Getwd()
	return cmd.Run() == nil
}

// ============================================
// FILE VALIDATION
// ============================================

func checkGitIgnore() (bool, bool, error) {
	// Check if .env* is in .gitignore
	gitignoreData, err := os.ReadFile(".gitignore")
	if err != nil {
		return false, false, fmt.Errorf("no .gitignore found")
	}

	envIgnored := false
	cryptoIgnored := false

	scanner := bufio.NewScanner(bytes.NewReader(gitignoreData))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if strings.HasPrefix(line, ".env") || line == ".env" {
			envIgnored = true
		}
		if strings.Contains(line, ".env.crypto") {
			cryptoIgnored = true
		}
	}

	return envIgnored, cryptoIgnored, nil
}

// ============================================
// HANDLERS
// ============================================

func handleInit(service *EnvwareService, privKey *rsa.PrivateKey, pubStr string, isGitMode bool) {
	if !isGitMode {
		color.Red("❌ This command must run under 'git envware init'")
		return
	}

	if !isGitRepo() {
		color.Red("❌ Not a git repository. Run this command in a git repo.")
		return
	}

	remote, err := getGitRemote()
	if err != nil {
		color.Red("❌ %v", err)
		color.Yellow("💡 Run 'git remote add origin <url>' first")
		return
	}

	color.Cyan("📂 Git repo detected: %s", remote)
	color.Cyan("🔐 Authenticating...")

	// Get auth challenge
	challenge, err := service.getAuthChallenge(pubStr, privKey)
	if err != nil {
		color.Red("❌ Challenge error: %v", err)
		return
	}

	// Call API to initialize project
	req := map[string]string{
		"publicKey": pubStr,
		"signature": challenge,
		"remoteUrl": remote,
	}

	resp, err := service.APIRequest("POST", "/projects/init", req)
	if err != nil {
		color.Red("❌ API Error: %v", err)
		return
	}

	var res RequestResponse
	json.Unmarshal(resp, &res)

	if res.Success {
		color.Green("✅ %s", res.Message)
		color.Cyan("🏷️  Team: %s | Project: %s", res.TeamSlug, res.ProjectSlug)
		// Save project info locally
		service.SaveProject(res.TeamSlug, res.ProjectSlug)
	} else {
		color.Yellow("⚠️  %s", res.Message)
		if res.LimitReached != "" {
			color.Yellow("💡 Run 'git envware buy project 1' to purchase more projects")
		}
	}
}

func handlePush(service *EnvwareService, privKey *rsa.PrivateKey, pubStr string, isGitMode bool) {
	if !isGitMode {
		color.Red("❌ This command must run under 'git envware push'")
		return
	}

	if !isGitRepo() {
		color.Red("❌ Not a git repository")
		return
	}

	remote, err := getGitRemote()
	if err != nil {
		color.Red("❌ %v", err)
		return
	}
	_ = remote

	// Check .gitignore
	envIgnored, cryptoIgnored, err := checkGitIgnore()
	if err != nil {
		color.Red("❌ %v", err)
		return
	}

	if !envIgnored {
		color.Red("❌ .env* files must be in .gitignore before pushing!")
		color.Yellow("💡 Add '.env*' to your .gitignore")
		return
	}

	if cryptoIgnored {
		color.Red("❌ .env.crypto must NOT be in .gitignore!")
		color.Yellow("💡 Remove '.env.crypto' from your .gitignore")
		return
	}

	// Get team/project from remote
	remoteURL, _ := getGitRemote()
	project := service.LoadProjectFromRemote(remoteURL)
	if project.Team == "" || project.Project == "" {
		color.Red("❌ Project not linked. Run 'git envware init' first.")
		return
	}

	color.Cyan("🔐 Authenticating...")

	// Get auth challenge
	challenge, err := service.getAuthChallenge(pubStr, privKey)
	if err != nil {
		color.Red("❌ Challenge error: %v", err)
		return
	}

	// Get environment (default: .env)
	env := ".env"
	if len(os.Args) > 2 {
		env = os.Args[2]
	}

	color.Cyan("📂 Reading %s...", env)

	// Read and encrypt env file
	envData, err := parseEnvFile(env)
	if err != nil {
		color.Red("❌ Cannot read %s: %v", env, err)
		return
	}

	if len(envData) == 0 {
		color.Yellow("⚠️  No secrets found in %s", env)
		return
	}

	// Generate project key (in real app, this comes from secure storage)
	projectKey := service.GetProjectKey(project.Team, project.Project)

	// Encrypt secrets
	color.Cyan("🔒 Encrypting %d secrets...", len(envData))
	var secrets []Secret
	for k, v := range envData {
		sec, err := service.EncryptFullPair(k, v, projectKey, env)
		if err != nil {
			color.Red("❌ Encrypt error: %v", err)
			return
		}
		secrets = append(secrets, sec)
	}

	// Push to API
	req := map[string]interface{}{
		"publicKey":   pubStr,
		"signature":   challenge,
		"teamSlug":    project.Team,
		"projectSlug": project.Project,
		"environment": env,
		"secrets":     secrets,
	}

	resp, err := service.APIRequest("POST", "/projects/push", req)
	if err != nil {
		color.Red("❌ API Error: %v", err)
		return
	}

	var res RequestResponse
	json.Unmarshal(resp, &res)

	if res.Success {
		color.Green("✅ %d secrets pushed to %s/%s", len(secrets), project.Team, project.Project)
	} else {
		color.Red("❌ %s", res.Message)
	}
}

func handlePull(service *EnvwareService, privKey *rsa.PrivateKey, pubStr string, isGitMode bool) {
	if !isGitMode {
		color.Red("❌ This command must run under 'git envware pull'")
		return
	}

	if !isGitRepo() {
		color.Red("❌ Not a git repository")
		return
	}

	// Get team/project from remote
	remoteURL, _ := getGitRemote()
	project := service.LoadProjectFromRemote(remoteURL)
	if project.Team == "" || project.Project == "" {
		color.Red("❌ Project not linked. Run 'git envware init' first.")
		return
	}

	color.Cyan("🔐 Authenticating...")

	// Get auth challenge
	challenge, err := service.getAuthChallenge(pubStr, privKey)
	if err != nil {
		color.Red("❌ Challenge error: %v", err)
		return
	}

	// Get environment
	env := ".env"
	if len(os.Args) > 2 {
		env = os.Args[2]
	}

	// Pull from API
	req := map[string]string{
		"publicKey":   pubStr,
		"signature":   challenge,
		"teamSlug":    project.Team,
		"projectSlug": project.Project,
		"environment": env,
	}

	resp, err := service.APIRequest("POST", "/pull-secrets", req)
	if err != nil {
		color.Red("❌ API Error: %v", err)
		return
	}

	var res struct {
		Success     bool     `json:"success"`
		Message     string   `json:"message"`
		Secrets     []Secret `json:"secrets,omitempty"`
		Environment string   `json:"environment,omitempty"`
	}
	json.Unmarshal(resp, &res)

	if !res.Success {
		color.Red("❌ %s", res.Message)
		return
	}

	if len(res.Secrets) == 0 {
		color.Yellow("⚠️  No secrets in server for %s", env)
		return
	}

	// Decrypt secrets
	projectKey := service.GetProjectKey(project.Team, project.Project)
	color.Cyan("🔓 Decrypting %d secrets...", len(res.Secrets))

	var envContent string
	for _, sec := range res.Secrets {
		k, v, err := service.DecryptFullPair(sec, projectKey, env)
		if err != nil {
			color.Red("❌ Decrypt error: %v", err)
			return
		}
		envContent += k + "=" + v + "\n"
	}

	// Write to file
	err = os.WriteFile(env, []byte(envContent), 0644)
	if err != nil {
		color.Red("❌ Write error: %v", err)
		return
	}

	color.Green("✅ %d secrets pulled to %s", len(res.Secrets), env)
}

func handleRequest(service *EnvwareService, privKey *rsa.PrivateKey, pubStr string) {
	role := "dev"
	if len(os.Args) > 2 {
		role = os.Args[2]
	}

	// Validate role
	validRoles := map[string]bool{"dev": true, "test": true, "admin": true}
	if !validRoles[role] {
		color.Red("❌ Invalid role. Use: dev, test, or admin")
		return
	}

	// Get team/project
	if len(os.Args) < 4 {
		color.Red("Usage: git envware request <team> <project> [role]")
		return
	}
	team := os.Args[2]
	project := os.Args[3]
	if len(os.Args) > 4 {
		role = os.Args[4]
	}

	color.Cyan("📝 Requesting access to %s/%s as %s...", team, project, role)

	// Get fingerprint
	fingerprint := service.GetFingerprint(pubStr)

	// Get auth challenge
	challenge, err := service.getAuthChallenge(pubStr, privKey)
	if err != nil {
		color.Red("❌ Challenge error: %v", err)
		return
	}

	// Call API
	req := map[string]string{
		"publicKey":   pubStr,
		"signature":   challenge,
		"teamSlug":    team,
		"projectSlug": project,
		"role":        role,
	}

	resp, err := service.APIRequest("POST", "/request-access", req)
	if err != nil {
		color.Red("❌ API Error: %v", err)
		return
	}

	var res struct {
		Success    bool   `json:"success"`
		Message    string `json:"message"`
		RequestId  string `json:"requestId,omitempty"`
	}
	json.Unmarshal(resp, &res)

	if res.Success {
		color.Green("✅ %s", res.Message)
		color.Yellow("📋 Your fingerprint: %s", fingerprint[:16]+"...")
		color.Yellow("💬 Send this fingerprint to the project owner")
	} else {
		color.Red("❌ %s", res.Message)
	}
}

func handleAccept(service *EnvwareService, privKey *rsa.PrivateKey, pubStr string) {
	if len(os.Args) < 3 {
		color.Red("Usage: git envware accept <fingerprint> <team> <project> [role]")
		return
	}

	fingerprint := os.Args[2]
	team := ""
	project := ""
	role := "dev"

	if len(os.Args) > 3 {
		team = os.Args[3]
	}
	if len(os.Args) > 4 {
		project = os.Args[4]
	}
	if len(os.Args) > 5 {
		role = os.Args[5]
	}

	if team == "" || project == "" {
		color.Red("Usage: git envware accept <fingerprint> <team> <project> [role]")
		return
	}

	color.Cyan("🔐 Accepting %s to %s/%s as %s...", fingerprint[:16]+"...", team, project, role)

	// Get auth challenge
	challenge, err := service.getAuthChallenge(pubStr, privKey)
	if err != nil {
		color.Red("❌ Challenge error: %v", err)
		return
	}

	// Call API
	req := map[string]string{
		"publicKey":    pubStr,
		"signature":    challenge,
		"fingerprint":  fingerprint,
		"teamSlug":     team,
		"projectSlug": project,
		"role":         role,
	}

	resp, err := service.APIRequest("POST", "/approve-access", req)
	if err != nil {
		color.Red("❌ API Error: %v", err)
		return
	}

	var res struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
	}
	json.Unmarshal(resp, &res)

	if res.Success {
		color.Green("✅ %s", res.Message)
	} else {
		color.Red("❌ %s", res.Message)
	}
}

func handleStatus(service *EnvwareService, privKey *rsa.PrivateKey, pubStr string) {
	color.Cyan("🔐 Authenticating...")

	// Get auth challenge
	challenge, err := service.getAuthChallenge(pubStr, privKey)
	if err != nil {
		color.Red("❌ Challenge error: %v", err)
		return
	}

	// Call API
	req := map[string]string{
		"publicKey":   pubStr,
		"signature":   challenge,
	}

	resp, err := service.APIRequest("POST", "/user/status", req)
	if err != nil {
		color.Red("❌ API Error: %v", err)
		return
	}

	var res struct {
		Success    bool     `json:"success"`
		Message    string   `json:"message"`
		Fingerprint string  `json:"fingerprint"`
		IsOwner    bool     `json:"isOwner"`
		Teams      []struct {
			Name     string `json:"name"`
			Slug     string `json:"slug"`
			Projects []struct {
				Name     string `json:"name"`
				Slug     string `json:"slug"`
				Role     string `json:"role"`
			} `json:"projects"`
		} `json:"teams"`
		Billing *struct {
			TeamsUsed    int `json:"teamsUsed"`
			TeamsLimit   int `json:"teamsLimit"`
			ProjectsUsed int `json:"projectsUsed"`
			ProjectsLimit int `json:"projectsLimit"`
			UsersUsed    int `json:"usersUsed"`
			UsersLimit   int `json:"usersLimit"`
		} `json:"billing"`
	}
	json.Unmarshal(resp, &res)

	if !res.Success {
		color.Red("❌ %s", res.Message)
		return
	}

	color.Green("✅ Status for %s", res.Fingerprint[:16]+"...")
	color.Cyan("\n📦 Your teams and projects:")

	for _, team := range res.Teams {
		color.Yellow("\n🏠 Team: %s (%s)", team.Name, team.Slug)
		for _, proj := range team.Projects {
			roleIcon := "👤"
			if proj.Role == "OWNER" {
				roleIcon = "👑"
			} else if proj.Role == "ADMIN" {
				roleIcon = "⚡"
			}
			color.Green("  %s %s (%s)", roleIcon, proj.Name, proj.Slug)
		}
	}

	if res.Billing != nil {
		b := res.Billing
		color.Cyan("\n💳 Billing:")
		color.Green("  Teams:    %d / %d", b.TeamsUsed, b.TeamsLimit)
		color.Green("  Projects: %d / %d", b.ProjectsUsed, b.ProjectsLimit)
		color.Green("  Users:    %d / %d", b.UsersUsed, b.UsersLimit)

		if b.TeamsUsed >= b.TeamsLimit || b.ProjectsUsed >= b.ProjectsLimit || b.UsersUsed >= b.UsersLimit {
			color.Yellow("\n💡 Run 'git envware buy team|project|user [qty]' to purchase more")
		}
	}
}

func handleTeam(service *EnvwareService, privKey *rsa.PrivateKey, pubStr string) {
	subcmd := ""
	if len(os.Args) > 2 {
		subcmd = os.Args[2]
	}

	// Get auth challenge first
	challenge, err := service.getAuthChallenge(pubStr, privKey)
	if err != nil {
		color.Red("❌ Challenge error: %v", err)
		return
	}

	authReq := map[string]string{
		"publicKey": pubStr,
		"signature": challenge,
	}

	switch subcmd {
	case "list":
		color.Cyan("📋 Listing teams...")
		resp, err := service.APIRequest("POST", "/user/status", authReq)
		if err != nil {
			color.Red("❌ API Error: %v", err)
			return
		}

		var res struct {
			Success  bool   `json:"success"`
			Error    string `json:"message"`
			Teams    []struct {
				Name     string `json:"name"`
				Slug     string `json:"slug"`
				Projects []struct {
					Name string `json:"name"`
					Slug string `json:"slug"`
				} `json:"projects"`
			} `json:"teams"`
		}
		json.Unmarshal(resp, &res)

		if !res.Success {
			color.Red("❌ Error: %s", res.Error)
			return
		}

		if len(res.Teams) == 0 {
			color.Yellow("📭 No teams found")
			return
		}

		for _, team := range res.Teams {
			color.Green("\n🏠 %s (%s)", team.Name, team.Slug)
			for _, proj := range team.Projects {
				color.Cyan("   📁 %s", proj.Name)
			}
		}

	case "create":
		if len(os.Args) < 4 {
			color.Red("Usage: git envware team create <name>")
			return
		}
		name := os.Args[3]
		color.Cyan("🏠 Creating team: %s", name)

		createReq := map[string]interface{}{
			"publicKey": pubStr,
			"signature": challenge,
			"name":      name,
		}

		resp, err := service.APIRequest("POST", "/teams", createReq)
		if err != nil {
			color.Red("❌ API Error: %v", err)
			return
		}

		var res struct {
			Error string `json:"error"`
			Name  string `json:"name"`
			Slug  string `json:"slug"`
		}
		json.Unmarshal(resp, &res)

		if res.Error != "" {
			color.Red("❌ Error: %s", res.Error)
			return
		}

		color.Green("✅ Team '%s' created successfully!", res.Name)
		color.Cyan("   Slug: %s", res.Slug)

	case "remove":
		if len(os.Args) < 4 {
			color.Red("Usage: git envware team remove <name>")
			return
		}
		name := os.Args[3]
		color.Cyan("🗑️ Removing team: %s", name)

		removeReq := map[string]interface{}{
			"publicKey": pubStr,
			"signature": challenge,
			"teamSlug":  name,
		}

		resp, err := service.APIRequest("POST", "/team-delete", removeReq)
		if err != nil {
			color.Red("❌ API Error: %v", err)
			return
		}

		var res struct {
			Success bool   `json:"success"`
			Error   string `json:"error"`
		}
		json.Unmarshal(resp, &res)

		if !res.Success {
			color.Red("❌ Error: %s", res.Error)
			return
		}

		color.Green("✅ Team '%s' removed successfully!", name)

	default:
		color.Red("Usage: git envware team [list|create|remove] [name]")
	}
}

func handleBuy(service *EnvwareService, privKey *rsa.PrivateKey, pubStr string) {
	if len(os.Args) < 3 {
		color.Red("Usage: git envware buy [team|project|user] [qty]")
		color.Yellow("Examples:")
		color.Yellow("  git envware buy team 1")
		color.Yellow("  git envware buy project myteam 1")
		color.Yellow("  git envware buy user myteam myproject 1")
		return
	}

	// Get auth challenge first
	challenge, err := service.getAuthChallenge(pubStr, privKey)
	if err != nil {
		color.Red("❌ Challenge error: %v", err)
		return
	}

	itemType := os.Args[2]
	qty := 1
	team := ""
	project := ""

	if len(os.Args) > 3 {
		if itemType == "team" {
			fmt.Sscanf(os.Args[3], "%d", &qty)
		} else {
			team = os.Args[3]
			if len(os.Args) > 4 {
				project = os.Args[4]
				if len(os.Args) > 5 {
					fmt.Sscanf(os.Args[5], "%d", &qty)
				}
			}
		}
	}

	// Map itemType to API category
	category := ""
	switch itemType {
	case "team":
		category = "teams"
	case "project":
		category = "projects"
	case "user":
		category = "users"
	default:
		color.Red("Invalid type. Use: team, project, or user")
		return
	}

	color.Cyan("🛒 Opening Stripe checkout for %d x %s...", qty, itemType)

	// Build request
	req := map[string]interface{}{
		"publicKey": pubStr,
		"signature": challenge,
		"category":  category,
		"action":    "add",
		"quantity":  fmt.Sprintf("%d", qty),
	}

	if team != "" {
		req["teamSlug"] = team
	}
	if project != "" {
		req["projectSlug"] = project
	}

	resp, err := service.APIRequest("POST", "/purchase", req)
	if err != nil {
		color.Red("❌ API Error: %v", err)
		return
	}

	var res struct {
		Success    bool   `json:"success"`
		Error      string `json:"error"`
		Message    string `json:"message"`
		PaymentUrl string `json:"paymentUrl"`
	}
	json.Unmarshal(resp, &res)

	if !res.Success {
		color.Red("❌ Error: %s", res.Error)
		return
	}

	if res.PaymentUrl != "" {
		color.Green("✅ Purchase initiated!")
		color.Cyan("🔗 %s", res.PaymentUrl)
		color.Yellow("\n🌸 Open the link in your browser to complete payment.")
	} else {
		color.Green("✅ %s", res.Message)
	}
}

func handleRemove(service *EnvwareService, privKey *rsa.PrivateKey, pubStr string) {
	if len(os.Args) < 3 {
		color.Red("Usage: git envware remove [team|project|user] <args>")
		color.Yellow("Examples:")
		color.Yellow("  git envware remove team myteam")
		color.Yellow("  git envware remove project myteam myproject")
		color.Yellow("  git envware remove user myteam myproject <fingerprint>")
		return
	}

	// Get auth challenge first
	challenge, err := service.getAuthChallenge(pubStr, privKey)
	if err != nil {
		color.Red("❌ Challenge error: %v", err)
		return
	}

	itemType := os.Args[2]

	switch itemType {
	case "team":
		if len(os.Args) < 4 {
			color.Red("Usage: git envware remove team <name>")
			return
		}
		name := os.Args[3]
		color.Cyan("🗑️ Removing team: %s", name)

		req := map[string]interface{}{
			"publicKey": pubStr,
			"signature": challenge,
			"teamSlug":  name,
		}
		resp, err := service.APIRequest("POST", "/team-delete", req)
		if err != nil {
			color.Red("❌ API Error: %v", err)
			return
		}

		var res struct {
			Success bool   `json:"success"`
			Error   string `json:"error"`
			Message string `json:"message"`
		}
		json.Unmarshal(resp, &res)

		if !res.Success {
			color.Red("❌ Error: %s", res.Error)
			return
		}
		color.Green("✅ %s", res.Message)

	case "project":
		if len(os.Args) < 5 {
			color.Red("Usage: git envware remove project <team> <project>")
			return
		}
		team := os.Args[3]
		project := os.Args[4]
		color.Cyan("🗑️ Removing project %s from team %s", project, team)

		req := map[string]interface{}{
			"publicKey":   pubStr,
			"signature":  challenge,
			"teamSlug":   team,
			"projectSlug": project,
		}
		resp, err := service.APIRequest("POST", "/project-remove", req)
		if err != nil {
			color.Red("❌ API Error: %v", err)
			return
		}


		var res struct {
			Success bool   `json:"success"`
			Error   string `json:"error"`
			Message string `json:"message"`
		}
		json.Unmarshal(resp, &res)


		if !res.Success {
			color.Red("❌ Error: %s", res.Error)
			return
		}
		color.Green("✅ %s", res.Message)

	case "user":
		if len(os.Args) < 6 {
			color.Red("Usage: git envware remove user <team> <project> <fingerprint>")
			return
		}
		team := os.Args[3]
		project := os.Args[4]
		fingerprint := os.Args[5]
		color.Cyan("🗑️ Removing user %s from project %s/%s", fingerprint, team, project)

		req := map[string]interface{}{
			"publicKey":    pubStr,
			"signature":   challenge,
			"teamSlug":    team,
			"projectSlug": project,
			"fingerprint": fingerprint,
		}
		resp, err := service.APIRequest("POST", "/project-user-remove", req)
		if err != nil {
			color.Red("❌ API Error: %v", err)
			return
		}

		var res struct {
			Success bool   `json:"success"`
			Error   string `json:"error"`
			Message string `json:"message"`
		}
		json.Unmarshal(resp, &res)

		if !res.Success {
			color.Red("❌ Error: %s", res.Error)
			return
		}
		color.Green("✅ %s", res.Message)

	default:
		color.Red("Invalid type. Use: team, project, or user")
	}
}

// ============================================
// USAGE
// ============================================

func showUsage(isGitMode bool) {
	prefix := "envw"
	if isGitMode {
		prefix = "git envware"
	}

	color.Cyan("🌸 git-envware CLI v%s", Version)
	fmt.Println()
	color.Yellow("Usage:")
	fmt.Printf("  %s init                    Setup project in current git repo\n", prefix)
	fmt.Printf("  %s push                    Encrypt and sync secrets\n", prefix)
	fmt.Printf("  %s pull                    Sync and decrypt secrets\n", prefix)
	fmt.Printf("  %s request [role]         Request access (dev|test|admin)\n", prefix)
	fmt.Printf("  %s accept <fingerprint>   Approve access request\n", prefix)
	fmt.Printf("  %s status                  Show status\n", prefix)
	fmt.Printf("  %s team [cmd]              Manage teams\n", prefix)
	fmt.Printf("  %s buy [type] [args]       Purchase packs\n", prefix)
	fmt.Printf("  %s remove [type] [args]   Remove team/project/user\n", prefix)
	fmt.Println()
	color.Yellow("Examples:")
	fmt.Printf("  %s init\n", prefix)
	fmt.Printf("  %s push\n", prefix)
	fmt.Printf("  %s pull\n", prefix)
	fmt.Printf("  %s request dev\n", prefix)
	fmt.Printf("  %s accept abc123... myteam myproject dev\n", prefix)
	fmt.Printf("  %s team list\n", prefix)
	fmt.Printf("  %s buy team 1\n", prefix)
	fmt.Printf("  %s remove team myteam\n", prefix)
	fmt.Println()
	color.Green("More info: https://envware.com/docs")
}

// ============================================
// SERVICE & CRYPTO
// ============================================

type EnvwareService struct {
	HomeDir  string
	BaseURL  string
	SSHKeys  SSHKeys
}

func NewEnvwareService() *EnvwareService {
	home, _ := os.UserHomeDir()
	baseUrl := "https://www.envware.dev/api/v2"
	if os.Getenv("ENVW_LOCAL") == "true" {
		baseUrl = "http://localhost:3000/api/v2"
	}
	return &EnvwareService{HomeDir: home, BaseURL: baseUrl}
}

func (s *EnvwareService) GetSSHKeys() (string, string, error) {
	privPath := filepath.Join(s.HomeDir, ".ssh", "id_rsa")
	privBytes, err := os.ReadFile(privPath)
	if err != nil {
		return "", "", err
	}
	pubBytes, _ := os.ReadFile(privPath + ".pub")
	return string(privBytes), string(pubBytes), nil
}

func (s *EnvwareService) GetFingerprint(publicKey string) string {
	parts := strings.Split(strings.TrimSpace(publicKey), " ")
	keyData := parts[0]
	if len(parts) > 1 {
		keyData = parts[1]
	}
	der, _ := base64.StdEncoding.DecodeString(keyData)
	hash := sha256.Sum256(der)
	return base64.StdEncoding.EncodeToString(hash[:])
}

type ProjectInfo struct {
	Team    string
	Project string
}

func (s *EnvwareService) LoadProjectFromRemote(remote string) ProjectInfo {
	// Try to load from local cache
	cachePath := filepath.Join(s.HomeDir, ".envware", "project.json")
	data, err := os.ReadFile(cachePath)
	if err != nil {
		return ProjectInfo{}
	}
	var proj ProjectInfo
	json.Unmarshal(data, &proj)
	return proj
}

func (s *EnvwareService) SaveProject(team, project string) error {
	dir := filepath.Join(s.HomeDir, ".envware")
	os.MkdirAll(dir, 0700)
	data, _ := json.Marshal(ProjectInfo{Team: team, Project: project})
	return os.WriteFile(filepath.Join(dir, "project.json"), data, 0600)
}

func (s *EnvwareService) GetProjectKey(team, project string) string {
	// In real implementation, this comes from encrypted storage
	// For now, derive from team+project
	hash := sha256.Sum256([]byte(team + ":" + project))
	return hex.EncodeToString(hash[:])
}

func (s *EnvwareService) deriveKey(projectKey string, environment string) ([]byte, error) {
	salt := "envware-salt"
	if environment != "" && environment != ".env" {
		salt = "envware-salt-" + environment
	}
	return scrypt.Key([]byte(projectKey), []byte(salt), 16384, 8, 1, 32)
}

func (s *EnvwareService) EncryptFullPair(keyText, valText, projectKey, environment string) (Secret, error) {
	key, err := s.deriveKey(projectKey, environment)
	if err != nil {
		return Secret{}, err
	}

	block, _ := aes.NewCipher(key)
	gcm, _ := cipher.NewGCM(block)
	tagSize := gcm.Overhead()

	// Encrypt Key
	ivK := make([]byte, gcm.NonceSize())
	io.ReadFull(rand.Reader, ivK)
	sealedK := gcm.Seal(nil, ivK, []byte(keyText), nil)

	// Encrypt Value
	ivV := make([]byte, gcm.NonceSize())
	io.ReadFull(rand.Reader, ivV)
	sealedV := gcm.Seal(nil, ivV, []byte(valText), nil)

	return Secret{
		K:    hex.EncodeToString(sealedK[:len(sealedK)-tagSize]),
		TagK: hex.EncodeToString(sealedK[len(sealedK)-tagSize:]),
		IvK:  hex.EncodeToString(ivK),
		V:    hex.EncodeToString(sealedV[:len(sealedV)-tagSize]),
		Tag:  hex.EncodeToString(sealedV[len(sealedV)-tagSize:]),
		IvV:  hex.EncodeToString(ivV),
	}, nil
}

func (s *EnvwareService) DecryptFullPair(enc Secret, projectKey string, environment string) (string, string, error) {
	key, err := s.deriveKey(projectKey, environment)
	if err != nil {
		return "", "", err
	}

	block, _ := aes.NewCipher(key)
	gcm, _ := cipher.NewGCM(block)

	// Decrypt Key
	ivK, _ := hex.DecodeString(enc.IvK)
	valK, _ := hex.DecodeString(enc.K)
	tagK, _ := hex.DecodeString(enc.TagK)
	plaintextK, errK := gcm.Open(nil, ivK, append(valK, tagK...), nil)


	// Decrypt Value
	ivV, _ := hex.DecodeString(enc.IvV)
	valV, _ := hex.DecodeString(enc.V)
	tagV, _ := hex.DecodeString(enc.Tag)
	plaintextV, errV := gcm.Open(nil, ivV, append(valV, tagV...), nil)

	if errK != nil {
		return "", "", errK
	}
	return string(plaintextK), string(plaintextV), errV
}

func (s *EnvwareService) RSADecrypt(encStr string, privKey *rsa.PrivateKey) ([]byte, error) {
	data, err := base64.StdEncoding.DecodeString(encStr)
	if err != nil {
		return nil, err
	}
	return rsa.DecryptOAEP(sha256.New(), rand.Reader, privKey, data, nil)
}

func (s *EnvwareService) getAuthChallenge(pubStr string, privKey *rsa.PrivateKey) (string, error) {
	challReq, _ := json.Marshal(ChallengeRequest{PublicKey: pubStr})
	resp, err := http.Post(s.BaseURL+"/auth/challenge", "application/json", bytes.NewBuffer(challReq))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()


	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("server returned %d", resp.StatusCode)
	}

	var challResp ChallengeResponse
	if err := json.NewDecoder(resp.Body).Decode(&challResp); err != nil {
		return "", err
	}

	hashed := sha256.Sum256([]byte(challResp.Challenge))
	sig, err := rsa.SignPKCS1v15(rand.Reader, privKey, crypto.SHA256, hashed[:])
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(sig), nil
}

func (s *EnvwareService) GetGitRemoteURL() string {
	cmd := exec.Command("git", "remote", "get-url", "origin")
	out, err := cmd.Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(out))
}


func (s *EnvwareService) APIRequest(method string, path string, body interface{}) ([]byte, error) {
	var bodyBytes []byte
	if body != nil {
		var err error
		bodyBytes, err = json.Marshal(body)
		if err != nil {
			return nil, err
		}
	}

	req, err := http.NewRequest(method, s.BaseURL+path, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	return io.ReadAll(resp.Body)
}

func parseEnvFile(path string) (map[string]string, error) {
	file, _ := os.Open(path)
	defer file.Close()
	res := make(map[string]string)
	sc := bufio.NewScanner(file)
	for sc.Scan() {
		ln := strings.TrimSpace(sc.Text())
		if ln != "" && strings.Contains(ln, "=") {
			parts := strings.SplitN(ln, "=", 2)
			res[strings.TrimSpace(parts[0])] = strings.TrimSpace(parts[1])
		}
	}
	return res, nil
}