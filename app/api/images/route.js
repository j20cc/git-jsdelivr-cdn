import { getCurrentDate } from "@/utils/helper";
import { Octokit } from "@octokit/core";
import { NextResponse } from "next/server";

async function getTrees(token, owner, repo, sha) {
  try {
    // Octokit.js
    // https://github.com/octokit/core.js#readme
    const octokit = new Octokit({ auth: token })
    const res = await octokit.request("GET /repos/{owner}/{repo}/git/trees/{tree_sha}", {
      owner: owner,
      repo: repo,
      tree_sha: sha,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28"
      }
    })

    return res.data.tree
  } catch (error) {
    return NextResponse.json({ message: "get images fail" }, { status: 400 })
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  const owner = searchParams.get("owner")
  const repo = searchParams.get("repo")
  const branch = searchParams.get("branch")
  const sha = searchParams.get("sha")

  let list = []
  const top_path = "images"
  const trees = await getTrees(token, owner, repo, branch)
  const image_tree = trees.filter(item => item.path == top_path)
  if (image_tree.length == 0) {
    return NextResponse.json({ list })
  }

  let date_trees = await getTrees(token, owner, repo, image_tree[0].sha)
  date_trees = date_trees.filter(item => item.type == "tree" && item.path == getCurrentDate())
  if (date_trees.length == 0) {
    return NextResponse.json({ list })
  }

  const second_path = date_trees[0].path
  let img_trees = await getTrees(token, owner, repo, date_trees[0].sha)
  img_trees = img_trees.filter(item => item.type == "blob")

  list = img_trees.map(item => {
    const path = `${top_path}/${second_path}/${item.path}`
    const raw_url = getRawUrl(owner, repo, branch, path)
    const cdn_url = getCdnUrl(owner, repo, branch, path)
    return { raw_url, cdn_url }
  })

  return NextResponse.json({ list })
};
