import {
  addNode,
  appendChild,
  attachEventToRoute,
  bindStateToText,
  createMovieAppExample,
  createBinding,
  linkBehaviorToView,
  linkDataToView,
  moveNode,
  removeNode,
  renameNode,
  to3DJson,
  updateNodeProps,
} from "./index.ts";

const model = createMovieAppExample();

renameNode(model, "view:section:hero", "HeroSectionEdited");
updateNodeProps(model, "view:section:hero", {
  title: "Evolua Edited Hero",
  subtitle: "updated through formal operations",
});

addNode(model, {
  id: "view:text:footer-note",
  kind: "text",
  name: "FooterNote",
  props: {
    content: "Built with Evolua operations 🌸",
  },
  tags: ["text", "footer"],
});

appendChild(model, "view:page:dashboard", "view:text:footer-note");
moveNode(model, "view:text:footer-note", "view:section:hero", 1);
removeNode(model, "view:text:hero-title");

linkDataToView(model, "view:section:hero", {
  id: "data:state:ui:selectedGenre",
  kind: "state",
});

linkBehaviorToView(model, "view:text:footer-note", {
  id: "behavior:event:open-movie",
  kind: "event",
});

createBinding(model, "data:query:movies", {
  from: { id: "data:query:movies", kind: "query" },
  to: { id: "view:text:footer-note", kind: "text" },
  expression: "result.total -> footer summary",
});

bindStateToText(
  model,
  "data:state:ui:selectedGenre",
  "view:text:footer-note",
  "selectedGenre -> footer content"
);

attachEventToRoute(model, "behavior:event:open-movie", "route:movie-details", {
  eventName: "onMovieClick",
  to: "/movie/:id",
  condition: "movie.id is defined",
});

console.log(JSON.stringify(to3DJson(model), null, 2));
