const {
  renderToNodeStream,
  renderToStaticNodeStream,
} = require("react-dom/server");
const { Writable, pipeline } = require("stream");

const createRenderToStringAsync = (renderToNodeStreamFn) => (
  node,
  { scheduleFn = setImmediate } = {}
) =>
  new Promise((resolve, reject) => {
    let body = "";
    const writableStream = new Writable({
      write: (chunk, encoding, callback) => {
        body += chunk;
        scheduleFn(callback);
      },
    });
    pipeline(renderToNodeStreamFn(node), writableStream, (ex) => {
      if (ex) {
        return reject(ex);
      }
      resolve(body);
    });
  });

const renderToStringAsync = createRenderToStringAsync(renderToNodeStream);

const renderToStaticMarkupAsync = createRenderToStringAsync(
  renderToStaticNodeStream
);

module.exports = {
  renderToStringAsync,
  renderToStaticMarkupAsync,
};
