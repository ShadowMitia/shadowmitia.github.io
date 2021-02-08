import React from "react";
import { render } from "react-dom";
import { Router, Link } from "@reach/router";
import { App, ProjectPage } from "./App";
import "./index.css";



render(
  <Router style={{ height: "100%" }}>
    <App path="/" default />
    <ProjectPage path="projects/:project_slug"></ProjectPage>
  </Router>,
  document.getElementById("root")!
);
