/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import "./styles.css";

import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";

function Wrapper() {
  const [show, setShow] = useState(true);
  return (
    <React.StrictMode>
      <div className="App">
        <button onClick={() => setShow((v) => !v)}>
          {show ? "hide" : "show"}
        </button>
        {show && <App />}
      </div>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Wrapper />);
