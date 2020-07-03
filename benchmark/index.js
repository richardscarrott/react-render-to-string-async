process.env.NODE_ENV = "production";
const { suite, add, cycle, complete, save } = require("benny");
const React = require("react");
const { renderToString, renderToStaticMarkup } = require("react-dom/server");
const { renderToStringAsync, renderToStaticMarkupAsync } = require("../");
const fs = require("fs");

// This will degrade the performance of renderToStringAsync (setImmediate / setTimeout), but not
// renderToString or renderToStringAsync (process.nextTick / (fn) => fn())
// const block = () => {
//   setTimeout(() => {
//     for (var i = 0; i < 100000000; i++) {}
//     block();
//   }, 10);
// };
// block();

const Fixture = ({ childrenBreadth, depth }) => {
  if (!depth) {
    return null;
  }

  return React.createElement(
    "section",
    { className: `fixture-${depth}` },
    new Array(childrenBreadth).fill(null).map(function (_, i) {
      return React.createElement(
        "div",
        { className: `fixture-child-${i}`, key: i },
        [
          React.createElement("span", { key: "span" }, `Fixture Text ${i}`),
          React.createElement(Fixture, {
            key: "Fixture",
            childrenBreadth,
            depth: depth - 1,
          }),
        ]
      );
    })
  );
};

const createRenderToStringSuite = (name, root) => () =>
  suite(
    `renderToString (${name})`,
    add("renderToString", async () => {
      return renderToString(root);
    }),
    add("renderToStringAsync (setImmediate)", () => {
      return renderToStringAsync(root, {
        scheduleFn: setImmediate,
      });
    }),
    add("renderToStringAsync (setTimeout)", () => {
      return renderToStringAsync(root, {
        scheduleFn: setTimeout,
      });
    }),
    add("renderToStringAsync (process.nextTick)", () => {
      return renderToStringAsync(root, {
        scheduleFn: process.nextTick,
      });
    }),
    add("renderToStringAsync (Promise.resolve)", () => {
      return renderToStringAsync(root, {
        scheduleFn: (fn) => Promise.resolve().then(() => fn()),
      });
    }),
    add("renderToStringAsync ((fn) => fn())", () => {
      return renderToStringAsync(root, {
        scheduleFn: (fn) => fn(),
      });
    }),
    cycle(),
    complete(),
    save({
      file: `render-to-string-${name.replace(/\s/g, "-")}`,
      format: "chart.html",
    })
  );

const createRenderToStaticMarkupSuite = (name, root) => () =>
  suite(
    `renderToStaticMarkup (${name})`,
    add("renderToStaticMarkup", async () => {
      return renderToStaticMarkup(root);
    }),
    add("renderToStaticMarkupAsync (setImmediate)", () => {
      return renderToStaticMarkupAsync(root, {
        scheduleFn: setImmediate,
      });
    }),
    add("renderToStaticMarkupAsync (setTimeout)", () => {
      return renderToStaticMarkupAsync(root, {
        scheduleFn: setTimeout,
      });
    }),
    add("renderToStaticMarkupAsync (process.nextTick)", () => {
      return renderToStaticMarkupAsync(root, {
        scheduleFn: process.nextTick,
      });
    }),
    add("renderToStaticMarkupAsync (Promise.resolve)", () => {
      return renderToStaticMarkupAsync(root, {
        scheduleFn: (fn) => Promise.resolve().then(() => fn()),
      });
    }),
    add("renderToStaticMarkupAsync ((fn) => fn())", () => {
      return renderToStaticMarkupAsync(root, {
        scheduleFn: (fn) => fn(),
      });
    }),
    cycle(),
    complete(),
    save({
      file: `render-to-static-markup-${name.replace(/\s/g, "-")}`,
      format: "chart.html",
    })
  );

// ~6kb (before gzip) of HTML
const SMALL_ROOT = React.createElement(Fixture, {
  childrenBreadth: 9,
  depth: 2,
});

// ~488kb (before gzip) of HTML -- this is most 'real world' I expect.
const LARGE_ROOT = React.createElement(Fixture, {
  childrenBreadth: 9,
  depth: 4,
});

// ~4.4mb (before gzip) of HTML
const X_LARGE_ROOT = React.createElement(Fixture, {
  childrenBreadth: 9,
  depth: 5,
});

// const small = renderToString(SMALL_ROOT);
// fs.writeFileSync(__dirname + "/small.html", small);

// const large = renderToString(LARGE_ROOT);
// fs.writeFileSync(__dirname + "/large.html", large);

// const xlarge = renderToString(X_LARGE_ROOT);
// fs.writeFileSync(__dirname + "/xlarge.html", xlarge);

const suites = [
  createRenderToStringSuite("small component tree", SMALL_ROOT),
  createRenderToStringSuite("large component tree", LARGE_ROOT),
  createRenderToStaticMarkupSuite("small component tree", SMALL_ROOT),
  createRenderToStaticMarkupSuite("large component tree", LARGE_ROOT),
];

const main = async () => {
  for (const suite of suites) {
    await suite();
  }
};

main().catch((ex) => {
  console.error(ex);
  process.exit(1);
});
