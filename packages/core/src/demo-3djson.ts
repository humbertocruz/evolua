import { createMovieAppExample, to3DJson } from "./index.ts";

const model = createMovieAppExample();
const spatial = to3DJson(model);

console.log(JSON.stringify(spatial, null, 2));
