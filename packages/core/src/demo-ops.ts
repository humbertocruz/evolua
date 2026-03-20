import { createMovieAppExample, renameNode, to3DJson, updateNodeProps } from "./index.ts";

const model = createMovieAppExample();
renameNode(model, "view:section:hero", "HeroSectionEdited");
updateNodeProps(model, "view:section:hero", {
  title: "Evolua Edited Hero",
  subtitle: "updated through formal operations",
});

console.log(JSON.stringify(to3DJson(model), null, 2));
