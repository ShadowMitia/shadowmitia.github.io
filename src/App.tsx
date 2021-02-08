import React, { FunctionComponent, useState } from "react";

import marked from "marked";

import { Link, RouteComponentProps, useParams } from "@reach/router";
import Carousel from "react-elastic-carousel";

import { IconName, library, SizeProp } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { faFilePdf, faFilm, faImages } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

library.add(fab, faFilePdf, faFilm);

import data from "../public/data.json";

const social_links = [
  "https://github.com/shadowmitia",
  "https://twitter.com/shadowmitia",
  "https://stackoverflow.com/users/3313819/shadowmitia",
  "https://www.linkedin.com/in/dimitribelopopsky/",
  "twitch.tv/shadowmitia",
];

const projects = data.projects.map((p) => ({
  ...p,
  published_date: new Date(p.published_date),
}));

// TODO: To make external links work with reach-router, is this a bug?
// const a = Link;

// TODO: define scope and valid urls
// TODO: add tests!!!
export function getSocialNameFromURL(url: string): string {
  if (!url.startsWith("https://")) {
    url = `https://${url}`;
  }

  const hostname = new URL(url).hostname;
  // This won't work if urls are like this : hostname.fr.io
  // But this shouldn't happen for brands I think
  let last_dot = hostname.lastIndexOf(".");

  let name = hostname.substr(0, last_dot);
  const first_dot = name.lastIndexOf(".") + 1;
  name = name.substr(first_dot > 0 ? first_dot : 0);

  // Some hostnames don't match to their fontawesome icons directly
  switch (name) {
    case "stackoverflow":
      name = "stack-overflow";
      break;
    case "itch":
      name = "itch-io";
      break;
  }

  return name;
}

interface SocialIconProps {
  url: string;
  size?: string;
  className?: any;
}
const SocialIcon: FunctionComponent<SocialIconProps> = ({
  url,
  size,
  className,
}: SocialIconProps) => {
  const s = size ? size : "xs";
  const name = getSocialNameFromURL(url);

  return (
    <a className={className} href={url}>
      <FontAwesomeIcon
        className="fontawesomeicon"
        icon={["fab", name as IconName]}
        size={s as SizeProp}
      ></FontAwesomeIcon>
    </a>
  );
};

interface ProjectPageProps extends RouteComponentProps {
  project_slug?: string;
}

function Navbar() {
  return (
    <nav className="navbar">
      <Link to={"/"}>HOME</Link>

      {/* <span className="social_links_navbar">
        {social_links.map((link: string) => (
          <SocialIcon
            key={getSocialNameFromURL(link)}
            url={link}
            size="sm"
          ></SocialIcon>
        ))}
      </span> */}
    </nav>
  );
}

export function ProjectPage(props: ProjectPageProps) {
  const { project_slug } = props;

  const [text, setText] = useState("");

  const project = data.projects.find((p) => p.slug === project_slug);

  if (project === undefined) {
    console.error("No project found");
    return <div></div>;
  }

  fetch(`/${project!.slug}/${project!.file}`)
    .then((resp) => resp.text())
    .then((res) => setText(marked(res.substr(project!.offset))));

  return (
    <>
      <Navbar />
      <article className="project-article">
        <header
          style={{
            backgroundImage: `url(/${project!.slug}/${
              project!.featured_image
            })`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        ></header>
        {project!.album && (
          <Carousel
            disableArrowsOnEnd={true}
            isRTL={false}
            itemPosition={"CENTER"}
          >
            {project.album.map((item) => {
              console.log(item);
              let path = encodeURI(`/${project!.slug}/album/${item}`);
              console.log(path);
              return <img key={item} src={path} />;
            })}
          </Carousel>
        )}
        {text !== "" && <div dangerouslySetInnerHTML={{ __html: text }}></div>}
      </article>
    </>
  );
}

function Project(props: { project: any }) {
  const { project } = props;
  const path = `/${project.slug}/${project.featured_image}`;
  return (
    <article className="article">
      <picture>
        <img src={path} alt="" />
      </picture>
      <h1>
        ({project.published_date.getFullYear()}) {project.title}
      </h1>
      {project.summary && <p>{project.summary}</p>}
    </article>
  );
}

export function App(props: RouteComponentProps) {
  let projects_ = projects.sort(
    (a, b) => b.published_date.getTime() - a.published_date.getTime()
  );

  return (
    <>
      <div className="sidebar">
        <section>
          <header className="site-header">
            <div className="space-y">
              <p className="name">Dimitri Belopopsky</p>
              <p className="name-description">
                Interested in Interaction Design, Computer Graphics, Video Games
                and Programming.
              </p>
            </div>
            <div className="social_links">
              {social_links.map((link: string) => (
                <SocialIcon
                  key={getSocialNameFromURL(link)}
                  url={link}
                  size="sm"
                ></SocialIcon>
              ))}
            </div>
          </header>
        </section>
        <section className="projects">
          {projects_.map((p) => (
            <Link key={p.slug} className="link" to={`projects/${p.slug}`}>
              <Project project={p}></Project>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
