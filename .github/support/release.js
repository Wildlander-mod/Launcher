const { request } = require("@octokit/request");
const fs = require("fs");

requestWithAuth = request.defaults({
  headers: {
    authorization: `token ${process.env.ACCESS_TOKEN}`
  },
  owner: process.env.CI_REPOSITORY_OWNER_SLUG,
  repo: process.env.CI_REPOSITORY_NAME_SLUG
});

async function createRelease () {
  const response = await requestWithAuth("POST /repos/{owner}/{repo}/releases", {
    tag_name: process.env.CI_ACTION_REF_NAME,
    name: process.env.CI_ACTION_REF_NAME,
    body: `View the changelog at ${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/blob/${process.env.CI_ACTION_REF_NAME}/CHANGELOG.md`
  });

  const { data } = response;

  await requestWithAuth(`POST ${data.upload_url}`, {
    name: `Ultimate-Skyrim-launcher-${process.env.CI_ACTION_REF_NAME}.zip`,
    label: `Ultimate Skyrim Launcher ${process.env.CI_ACTION_REF_NAME}`,
    data: fs.readFileSync("./dist.zip")
  });
}

createRelease().catch((error) => {
  console.log(`API call failed with: ${error}`);
  process.exit(1);
});
