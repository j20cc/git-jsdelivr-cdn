import { Octokit } from "@octokit/core";
import { NextResponse } from "next/server";
const { createHash } = require("crypto");
import { getCurrentDate, generateRandomNumber, getRawUrl, getCdnUrl } from "@/utils/helper";
import { top_path, vip_users } from "@/utils/const";

const home_page = "https://ipic.j20.cc"
const committer_name = "luke_44"
const committer_email = "luke_44@163.com"

export async function POST(req) {
  const form = await req.formData()
  const file = form.get("file")
  const token = form.get("token")
  const branch = form.get("branch")
  const owner = form.get("owner")
  const repo = form.get("repo")
  const name = file.name
  const path = `${top_path}/${getCurrentDate()}/${generateRandomNumber()}_${name}`

  if (!file.type.startsWith("image")) {
    return NextResponse.json({ message: "只能上传图片" }, { status: 400 })
  }
  const vip = vip_users.includes(owner)
  if (!vip && (file.size >= 2 * 1024)) {
    return NextResponse.json({ message: "免费用户最大上传 2mb 图片" }, { status: 400 })
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const bs64 = buffer.toString("base64");
  const sha1Hash = createHash("sha1").update(buffer).digest("hex");
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

    if (res.status == 201) {
      const raw_url = getRawUrl(owner, repo, branch, path)
      const cdn_url = getCdnUrl(owner, repo, branch, path)
      return NextResponse.json({ name, raw_url, cdn_url })
    }
  } catch (error) {
    return NextResponse.json({ message: "上传失败" }, { status: 400 })
  }

  return NextResponse.json({ message: "上传失败" }, { status: 400 })
};
