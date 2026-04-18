package handler

import (
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/ssh"
)

type VerifyRequest struct {
	PublicKey string `json:"publicKey"`
	Signature string `json:"signature"`
	Challenge string `json:"challenge"`
}

type VerifyResponse struct {
	Verified bool   `json:"verified"`
	Error    string `json:"error"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req VerifyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 1. Parse da chave pública SSH
	pubKey, _, _, _, err := ssh.ParseAuthorizedKey([]byte(req.PublicKey))
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(VerifyResponse{Verified: false, Error: "Invalid public key format"})
		return
	}

	// 2. Extrair a chave RSA
	cryptoPubKey := pubKey.(ssh.CryptoPublicKey).CryptoPublicKey()
	rsaPubKey, ok := cryptoPubKey.(*rsa.PublicKey)
	if !ok {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(VerifyResponse{Verified: false, Error: "Only RSA keys supported"})
		return
	}
	
	// 3. Decode da assinatura
	sigBytes, err := base64.StdEncoding.DecodeString(req.Signature)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(VerifyResponse{Verified: false, Error: "Invalid signature base64"})
		return
	}

	hashed := sha256.Sum256([]byte(req.Challenge))
	
	// Verificação PKCS1v15 + SHA256 (O par perfeito do Go ENGINE)
	verifyErr := rsa.VerifyPKCS1v15(rsaPubKey, crypto.SHA256, hashed[:], sigBytes)

	w.Header().Set("Content-Type", "application/json")
	if verifyErr != nil {
		json.NewEncoder(w).Encode(VerifyResponse{Verified: false, Error: verifyErr.Error()})
		return
	}

	json.NewEncoder(w).Encode(VerifyResponse{Verified: true})
}
