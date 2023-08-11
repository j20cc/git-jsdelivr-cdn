import { top_path } from "@/utils/const";
import { getCurrentDate, getRawUrl, getCdnUrl } from "@/utils/helper";
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

  const second_path = getCurrentDate()
  let list = []
  let sha1 = sha
  let trees = await getTrees(token, owner, repo, sha || branch)
  console.log("1: ", trees);
  if (!sha) {
    trees = trees.filter(item => item.path == top_path)
    if (trees.length == 0) {
      return NextResponse.json({ list })
    }

    //第二级目录
    trees = await getTrees(token, owner, repo, trees[0].sha)
    trees = trees.filter(item => item.type == "tree" && item.path == second_path)
    if (trees.length == 0) {
      return NextResponse.json({ list })
    }
    sha1 = trees[0].sha
    console.log("2: ", trees);
    //第后一级目录
    trees = await getTrees(token, owner, repo, sha1)
    trees = trees.filter(item => item.type == "blob")
    console.log("3: ", trees);
    if (trees.length == 0) {
      return NextResponse.json({ list })
    }
  }

  list = trees.map(item => {
    const path = `${top_path}/${second_path}/${item.path}`
    const name = item.path
    const raw_url = getRawUrl(owner, repo, branch, path)
    const cdn_url = getCdnUrl(owner, repo, branch, path)
    return { name, raw_url, cdn_url }
  })

  return NextResponse.json({ sha1, list })
};
