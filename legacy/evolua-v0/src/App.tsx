import { useMemo } from 'react';
import { appManifest, structureDimension, visualDimension } from './demo-data';

type StructureNode = {
  id: string;
  kind: string;
  name: string;
  children: string[];
};

type VisualNode = {
  structureNodeId: string;
  componentType: string;
  props?: Record<string, string>;
  styleTokens?: string[];
};

const structureNodes = structureDimension.nodes as Record<string, StructureNode>;
const visualNodes = visualDimension.nodes as Record<string, VisualNode>;

function renderStructure(nodeId: string): JSX.Element | null {
  const node = structureNodes[nodeId];
  if (!node) return null;

  return (
    <li key={node.id}>
      <div className="tree-node">
        <span className="tree-kind">{node.kind}</span>
        <span className="tree-name">{node.name}</span>
      </div>
      {node.children.length > 0 ? (
        <ul>
          {node.children.map((childId) => renderStructure(childId))}
        </ul>
      ) : null}
    </li>
  );
}

function renderPreview(nodeId: string): JSX.Element | null {
  const node = structureNodes[nodeId];
  const visual = visualNodes[nodeId];
  if (!node) return null;

  if (node.kind === 'page') {
    return (
      <div className="preview-page" key={node.id}>
        {node.children.map((childId) => renderPreview(childId))}
      </div>
    );
  }

  if (node.kind === 'section') {
    return (
      <div className="preview-card" key={node.id}>
        {node.children.map((childId) => renderPreview(childId))}
      </div>
    );
  }

  if (visual?.componentType === 'Text') {
    const isForgot = node.id.includes('forgot-password');
    return (
      <div key={node.id} className={isForgot ? 'forgot-link' : 'title-text'}>
        {visual.props?.content ?? node.name}
      </div>
    );
  }

  if (visual?.componentType === 'TextField' || visual?.componentType === 'PasswordField') {
    return (
      <label key={node.id} className="field-wrap">
        <span>{visual.props?.label ?? node.name}</span>
        <input type={visual.componentType === 'PasswordField' ? 'password' : 'text'} placeholder={visual.props?.label ?? ''} />
      </label>
    );
  }

  if (visual?.componentType === 'Button') {
    return (
      <button key={node.id} className="submit-button">
        {visual.props?.label ?? 'Button'}
      </button>
    );
  }

  return (
    <div key={node.id} className="unknown-node">
      {node.name}
    </div>
  );
}

export function App() {
  const rootIds = useMemo(() => structureDimension.roots as string[], []);

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Evolu[a] Dev</div>
          <h1>{appManifest.name}</h1>
        </div>
        <div className="manifest-badge">{appManifest.format}</div>
      </header>

      <main className="panes">
        <section className="pane left-pane">
          <div className="pane-header">Estrutura</div>
          <ul className="tree-root">
            {rootIds.map((rootId) => renderStructure(rootId))}
          </ul>
        </section>

        <section className="pane right-pane">
          <div className="pane-header">Preview</div>
          <div className="preview-wrap">
            {rootIds.map((rootId) => renderPreview(rootId))}
          </div>
        </section>
      </main>
    </div>
  );
}
