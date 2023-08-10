import { Octokit } from "@octokit/core";
import { NextResponse } from "next/server";
const { createHash } = require("crypto");
import { getCurrentDate, generateRandomNumber, getRawUrl, getCdnUrl } from "@/utils/helper";
import { top_path } from "@/utils/const";

const home_page = "https://ipic.j20.cc"
const committer_name = "luke_44"
const committer_email = "luke_44@163.com"

export async function POST(req) {
  const form = await req.formData()
  const file = form.get("file")
  const buffer = Buffer.from(await file.arrayBuffer());
  const bs64 = buffer.toString("base64");
  const sha1Hash = createHash("sha1").update(buffer).digest("hex");
  const token = form.get("token")
  const branch = form.get("branch")
  const owner = form.get("owner")
  const repo = form.get("repo")
  const path = `${top_path}/${getCurrentDate()}/${generateRandomNumber()}_${file.name} `

  try {
    // Octokit.js
    // https://github.com/octokit/core.js#readme
    const octokit = new Octokit({ auth: token })
    const res = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner: owner,
      repo: repo,
      path: path,
      message: `upload by ${home_page} `,
      committer: {
        name: committer_name,
        email: committer_email
      },
      content: bs64,
      branch: branch,
      sha: sha1Hash,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28"
      }
    })
  } catch (error) {
    return NextResponse.json({ message: "upload fail" }, { status: 400 })
  }

  if (res.status == 201) {
    const raw_url = getRawUrl(owner, repo, branch, path)
    const cdn_url = getCdnUrl(owner, repo, branch, path)
    return NextResponse.json({ raw_url, cdn_url })
  }

  return NextResponse.json({ message: "upload fail" }, { status: 400 })
};
