import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import Mermaid from "@theme/Mermaid";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          📝 Lexical Builder 🛠️
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

function Solution({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-2xl">{title}</dt>
      <dd className="ms-4">{children}</dd>
    </div>
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
      <section className="container container-fluid pt-4">
        <h2 className="text-4xl">Solved Problems</h2>
        <dl className="grid md:grid-cols-2 gap-x-6 gap-y-2">
          <Solution title="Modularized editor configuration">
            Each Plan can specify partial editor configuration (nodes, theme,
            DOM import/export, etc.) that are all merged to build the editor
          </Solution>
          <Solution title="Combined config + registration">
            Generally there are interdependencies between configuration and
            behavior, e.g. the ListPlugin requires ListNode and ListItemNode and
            vice versa.
          </Solution>
          <Solution title="Hassle-free dependencies">
            A Plan is completely self-contained, and specifies all dependencies
            to make it work. If you want checklists, add CheckListPlan as a
            dependency to your editor's plan. No more missing Node errors or
            silently absent behavior.
          </Solution>
          <Solution title="Optional peer dependencies">
            Have an optional dependency? No problem. You can even specify config
            overrides if peer dependencies are present! This is used internally
            so Plans can provide an error if a suitable framework host is not
            available (e.g. <code>ReactPlan</code> is used, but there's no{" "}
            <code>LexicalPlanComposer</code> or <code>ReactPluginHostPlan</code>
            )
          </Solution>
          <Solution title="Framework independent">
            Many Plugins don't really need React, but the only legacy convention
            is to expose as much behavior as possible in a React component even
            if it just calls some register functions and returns null.
          </Solution>
          <Solution title="React anywhere">
            Non-React users can use the <code>ReactPluginHostPlan</code> to use
            React Plans or legacy Plugins! This of course still uses React at
            runtime, but does not force the user to learn React, use JSX syntax,
            or have any direct React dependency in their project.
          </Solution>
          <Solution title="Extensible config">
            Each Plan can specify its own optional typed configuration of any
            kind, that can be specified by any other plan, and is accessible at
            runtime anywhere you can get an editor reference (even in a Node!).
            No need to shoehorn properties into the editor-global{" "}
            <code>EditorTheme &#x7B; [key: string]: any &#x7D;</code> or set up
            a module-global <code>WeakMap&lt;Editor, Config&gt;</code>{" "}
            workaround.
          </Solution>
          <Solution title="Outputs">
            A Plan can specify type-safe outputs, which are computed when the
            plan is registered to the editor (so can take configuration, the
            editor, and dependencies into account). These can be used by
            dependencies, or anywhere you have an editor reference. Think of it
            like having a sort of React style context for each Plan in your
            editor!
          </Solution>
        </dl>
      </section>
      <section className="container container-fluid pt-4">
        <h2 className="text-center">Adding a Plugin</h2>
        <div className="grid grid-cols-2 gap-4 content-center">
          <div className="flex flex-col gap-2 [&>div]:mx-auto">
            <h3 className="text-center">🧩 Using Legacy (React) Plugins</h3>
            <Mermaid
              value={`flowchart TD
    A[Import Component]
    B[Add Component as a child\nof LexicalComposer]
    C(Does it need Nodes?)
    D[Add nodes to Editor config]
    E(Does it depend on other Plugins?)
    G(😅 Done)
    A --> B --> C
    C -->|No| E
    C -->|Yes| D
    D --> E
    E -->|No| G
    E .->|Recurse for\neach dependency| A
`}
            />
          </div>
          <div className="flex flex-col gap-2 [&>div]:mx-auto">
            <h3 className="text-center">🗂️ Using Lexical Builder Plans</h3>
            <Mermaid
              value={`flowchart TD
    A[Import Plan]
    B[Add Plan to your editor's\nPlan dependencies]
    C(Does it need UI in a specific place?)
    D[Add Plan's output Component as\na child of LexicalPlanComposer]
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
