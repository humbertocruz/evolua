import {
  type AppModel,
  type BehaviorNode,
  type DataNode,
  type RouteNode,
  type ViewNode,
  createEmptyAppModel,
} from "../model.ts";

export function createMovieAppExample(): AppModel {
  const model = createEmptyAppModel("Evolua Movie Example");

  const dashboardPage: ViewNode = {
    id: "view:page:dashboard",
    kind: "page",
    name: "DashboardPage",
    componentType: "Page",
    children: ["view:section:hero", "view:component:movie-list"],
    tags: ["page", "root"],
  };

  const heroSection: ViewNode = {
    id: "view:section:hero",
    kind: "section",
    name: "HeroSection",
    componentType: "Section",
    props: {
      title: "Evolua Movies",
      subtitle: "Um exemplo mínimo do app multidimensional.",
    },
    children: ["view:text:hero-title"],
    styleTokens: ["bg-zinc-950", "text-zinc-100"],
  };

  const heroTitle: ViewNode = {
    id: "view:text:hero-title",
    kind: "text",
    name: "HeroTitle",
    props: {
      content: {
        kind: "binding",
        value: "state:ui:selectedGenre",
      },
    },
    tags: ["text", "binding"],
  };

  const movieList: ViewNode = {
    id: "view:component:movie-list",
    kind: "component",
    name: "MovieList",
    componentType: "MovieList",
    props: {
      items: {
        kind: "binding",
        value: "query:movies",
      },
    },
    dataRefs: [{ id: "data:query:movies", kind: "query" }],
    behaviorRefs: [{ id: "behavior:event:open-movie", kind: "event" }],
    tags: ["list", "movies"],
  };

  const movieEntity: DataNode = {
    id: "data:entity:movie",
    kind: "entity",
    name: "Movie",
    schema: {
      fields: [
        { name: "id", type: "number", required: true },
        { name: "title", type: "string", required: true },
        { name: "overview", type: "string" },
        { name: "posterUrl", type: "string" },
      ],
    },
    tags: ["domain", "movie"],
  };

  const moviesQuery: DataNode = {
    id: "data:query:movies",
    kind: "query",
    name: "MoviesQuery",
    source: {
      kind: "remote-query",
      reference: "GET /api/movies",
    },
    relationRefs: [{ id: "data:entity:movie", kind: "entity" }],
    bindingRefs: [
      {
        from: { id: "data:query:movies", kind: "query" },
        to: { id: "view:component:movie-list", kind: "component" },
        expression: "result.items -> props.items",
      },
    ],
    tags: ["query", "remote"],
  };

  const selectedGenreState: DataNode = {
    id: "data:state:ui:selectedGenre",
    kind: "state",
    name: "SelectedGenreState",
    source: {
      kind: "local-state",
      reference: "selectedGenre",
    },
    bindingRefs: [
      {
        from: { id: "data:state:ui:selectedGenre", kind: "state" },
        to: { id: "view:text:hero-title", kind: "text" },
        expression: "selectedGenre -> title content",
      },
    ],
    tags: ["state", "ui"],
  };

  const openMovieEvent: BehaviorNode = {
    id: "behavior:event:open-movie",
    kind: "event",
    name: "OpenMovieEvent",
    trigger: {
      kind: "event",
      name: "onMovieClick",
      sourceRef: { id: "view:component:movie-list", kind: "component" },
    },
    operation: {
      kind: "navigate",
      name: "GoToMovieDetails",
      input: {
        kind: "expression",
        value: "/movie/:id",
      },
    },
    targetRefs: [{ id: "route:movie-details", kind: "route" }],
    sideEffects: [
      {
        kind: "log",
        name: "log-navigation",
        payload: "movie selected",
      },
    ],
    tags: ["navigation", "interaction"],
  };

  const movieDetailsRoute: RouteNode = {
    id: "route:movie-details",
    kind: "route",
    name: "MovieDetailsRoute",
    path: "/movie/:id",
    pageRef: { id: "view:page:dashboard", kind: "page" },
    params: [{ name: "id", type: "number", required: true }],
    transitions: [{ eventName: "onMovieClick", to: "/movie/:id" }],
    tags: ["route"],
  };

  model.app.rootPageIds.push(dashboardPage.id);
  model.app.routeIds.push(movieDetailsRoute.id);

  const nodes = [
    dashboardPage,
    heroSection,
    heroTitle,
    movieList,
    movieEntity,
    moviesQuery,
    selectedGenreState,
    openMovieEvent,
    movieDetailsRoute,
  ];

  for (const node of nodes) {
    model.nodes[node.id] = node;
  }

  model.buildTargets.push(
    {
      id: "target:web",
      kind: "nextjs",
      name: "Next.js App Router",
    },
    {
      id: "target:data",
      kind: "prisma",
      name: "Prisma",
    }
  );

  return model;
}
