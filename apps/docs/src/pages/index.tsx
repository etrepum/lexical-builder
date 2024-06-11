import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
// import AddingAPlugin from "@site/docs/_adding-a-plugin.mdx";
import Mermaid from "@theme/Mermaid";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro"
          >
            Intro
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro"
          >
            API docs
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="EXPERIMENTAL @etrepum/lexical-builder plugin"
    >
      <HomepageHeader />
      <section className="container container-fluid">
        <h2>Adding a Plugin</h2>
        <div className="row">
          <div className="col">
            <h3>Lexical React Plugins</h3>
            <Mermaid
              value={`flowchart TD
    A[Import Plugin]
    B[Add Plugin as a child of LexicalComposer]
    C(Does it need Nodes?)
    D[Add nodes to Editor configuration]
    E(Does it depend on other Plugins?)
    G(😅 Done)
    A --> B --> C
    C -->|No| E
    C -->|Yes| D
    D --> E
    E -->|No| G
    E .->|Recurse for each dependency| A
`}
            />
          </div>
          <div className="col">
            <h3>Lexical Builder Plans</h3>
            <Mermaid
              value={`flowchart TD
    A[Import Plugin's Plan]
    B[Add Plugin's Plan as a dependency to your editor's Plan]
    C(Does it need UI in a specific place?)
    D[Render component as child of LexicalPlanComposer]
    E(😌 Done)
    A --> B --> C
    C -->|No| E
    C -->|Yes| D
    D --> E
`}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}
