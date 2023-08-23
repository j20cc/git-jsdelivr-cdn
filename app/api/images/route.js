import { top_path, vip_users } from "@/utils/const";
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
    return []
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  const owner = searchParams.get("owner")
  const repo = searchParams.get("repo")
  const branch = searchParams.get("branch")
  const path = searchParams.get("path")

  let list = []
  let second_path = getCurrentDate()
  const vip = vip_users.includes(owner)
  if (vip && path) {
    second_path = path
  }
  let trees = await getTrees(token, owner, repo, branch)
  trees = trees.filter(item => item.path == top_path)
  if (trees.length == 0) {
    return NextResponse.json({ vip, list })
  }

  //第二级目录
  let sha1 = ''
  trees = await getTrees(token, owner, repo, trees[0].sha)
  list = trees.filter(item => item.type == "tree").map(item => {
    let fold = false
    let children = []
    if (item.path == second_path) {
      fold = true
      sha1 = item.sha
    }
    return { ...item, fold, children }
  })
  if (list.length == 0) {
    return NextResponse.json({ vip, list })
  }

  if (sha1) {
    // console.log("sha1: ", sha1);
    let children = await getTrees(token, owner, repo, sha1)
    // console.log("children: ", children);
    children = children.filter(item => item.type == "blob")
      .map(item => {
        const new_path = `${top_path}/${second_path}/${item.path}`
        const raw_url = getRawUrl(owner, repo, branch, new_path)
        const cdn_url = getCdnUrl(owner, repo, branch, new_path)
        return { ...item, raw_url, cdn_url }
      })
    list = list.map(item => {
      if (item.fold) {
        return { ...item, children }
      } else {
        return item
      }
    })
  }
  list.sort((a, b) => b.path - a.path);
  return NextResponse.json({ vip, list })
};
