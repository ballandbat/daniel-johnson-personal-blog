const path = require("path");

/**
 * Creates a page for each markdown blog post file in src/pages/.
 */
exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions;

  const result = await graphql(`
    {
      allMdx(sort: { order: DESC, fields: [frontmatter___date] }, limit: 1000) {
        edges {
          node {
            id
            fileAbsolutePath
            frontmatter {
              path
            }
          }
        }
      }
      site {
        siteMetadata {
          rootUrl
          repoRootUrl
        }
      }
    }
  `);

  if (result.errors) {
    throw new Error(result.errors);
  }

  const { rootUrl, repoRootUrl } = result.data.site.siteMetadata;

  for (const { node } of result.data.allMdx.edges) {
    const { frontmatter, fileAbsolutePath } = node;

    if (!frontmatter.path) {
      // Some blog posts are split into multiple mdx files--only the
      // top-level one will have a `path` frontmatter attribute.
      continue;
    }

    const twitterSearchParam = `${rootUrl}${frontmatter.path}`;
    const twitterSearchUrl = `https://twitter.com/search?q=${encodeURIComponent(
      twitterSearchParam
    )}`;

    const githubSourceUrl = `${repoRootUrl}${fileAbsolutePath
      .replace(__dirname, "")
      .replace("/index.mdx", "")}`;

    createPage({
      path: frontmatter.path,
      component: path.resolve("./src/templates/blog-post.js"),
      context: { twitterSearchUrl, githubSourceUrl },
    });
  }
};
