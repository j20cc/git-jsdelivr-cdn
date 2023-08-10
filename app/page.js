'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react';

export default function Page() {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [url, setUrl] = useState('')
  const [branches, setBranches] = useState(['master', 'main'])
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [token, setToken] = useState('')
  const [branch, setBranch] = useState(branches[0])
  const [sha, setSha] = useState('')

  useEffect(() => {
    const getSettings = async () => {
      const settings = localStorage.getItem("settings")
      console.log("settings: ", settings);
      if (settings) {
        const { owner, repo, token, branch, sha } = JSON.parse(settings)
        setUrl(`${owner}/${repo}`)
        setOwner(owner)
        setRepo(repo)
        setToken(token)
        setBranch(branch)
        setBranches([branch])
        setSha(sha)
      }
    }

    getSettings()
  }, [])

  useEffect(() => {
    const getImages = async () => {
      const res = await fetch(`/api/images?token=${token}&owner=${owner}&repo=${repo}&branch=${branch}`)
      const data = await res.json()
      console.log("getImages data: ", data);
      if (data.sha1) {
        setSha(data.sha1)
      }
    }

    if (token && owner && repo) {
      getImages()
    }
  }, [token])

  useEffect(() => {
    if (sha) {
      handleSave()
    }
  }, [sha])

  const handleFileChange = async (event) => {
    let f = event.target.files[0]

  };

  const parseRepoUrl = (url) => {
    const githubLinkRegex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)(?:\/.*)?$/;
    const match = url.match(githubLinkRegex);
    if (match) {
      const owner = match[1]
      const repo = match[2]
      return { owner, repo }
    } else {
      return false
    }
  }

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files[0];
    console.log(file);
    setSelectedFile(file);
  };

  const handleParseGithub = () => {
    const url_split = url.split("/")
    let info = parseRepoUrl(url)
    if (url_split.length == 2) {
      info = { owner: url_split[0], repo: url_split[1] }
    }
    if (info) {
      setOwner(info.owner)
      setRepo(info.repo)
      setUrl(`${info.owner}/${info.repo}`)
    }
  }

  const handleGetBranches = async () => {
    if (token && owner && repo) {
      const URL = `https://api.github.com/repos/${owner}/${repo}/branches`;
      const headers = {
        Accept: 'application/vnd.github+json',
        "Authorization": `Bearer ${token}`,
      };
      const response = await fetch(URL, { headers });
      const data = await response.json();
      const list = data.map(item => item.name);
      if (list.length > 0) {
        setBranches(list)
        setBranch(list[0])
      }
    }
  }

  const handleSave = () => {
    const setting_info = {
      token,
      owner,
      repo,
      branch,
      sha
    }
    console.log("setting_info", setting_info);
    localStorage.setItem("settings", JSON.stringify(setting_info));
  }

  const renderSetting = () => {
    return (<div className="bg-white border shadow rounded px-3 py-2 flex items-center">
      <div className="flex items-center">
        <p className='text-gray-600 text-sm'>存储仓库:</p>
        <input
          value={url} onChange={e => setUrl(e.target.value)} onBlur={handleParseGithub}
          type="text" className='border text-gray-600 rounded h-7 px-1 ml-2 focus:outline-none' />
      </div>

      <div className="flex items-center ml-2">
        <p className='text-gray-600 text-sm'>token:</p>
        <input value={token} onChange={e => setToken(e.target.value)} onBlur={handleGetBranches} type="text" className='w-80  border text-gray-600 rounded h-7 px-1 ml-2 focus:outline-none' />
      </div>
      <div className="flex items-center ml-2">
        <p className='text-gray-600 text-sm'>分支:</p>
        <select onChange={e => setBranch(e.target.value)} defaultValue={branch} className='border text-gray-600 rounded h-7 px-1 ml-2 focus:outline-none'>
          {branches.map(item => <option value={item} key={item}>{item}</option>)}
        </select>
      </div>
      <div className="flex items-baseline ml-auto">
        <p className='text-gray-500 text-sm'>*数据只会存在本地，请放心使用</p>
        <p className='text-gray-500 text-sm ml-2'>*帮助</p>
        <button onClick={handleSave} className='bg-green-300 text-white text-sm border rounded px-3 py-1 ml-2'>保 存</button>
      </div>
    </div >)
  }

  // https://api.github.com/repos/tw93/Maple/branches
  return (
    <div className="container mx-auto py-10">
      {renderSetting()}

      <div className="flex mt-3">
        <div className="bg-white border shadow rounded w-1/3">
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="px-3 flex items-baseline border-b py-2">
            <p className="text-gray-700 text-lg font-bold">上传</p>
            <p className="text-gray-500 text-sm ml-3">点击选择图片上传，或者拖动图片上传</p>
          </div>

          <div
            onClick={() => document.getElementById("fileInput").click()}
            className="flex-row py-10 cursor-pointer">
            <Image src="/assets/upload.png" alt="upload" width="64" height="64" className="mx-auto" />
            <input
              id="fileInput"
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <p className="text-gray-500 text-sm mt-5 text-center">正在上传: xxxxxxx</p>
          </div>
        </div>

        <div className="bg-white border shadow rounded w-2/3 ml-5">
          <div className="px-3 flex items-baseline border-b py-2">
            <p className="text-gray-700 text-lg font-bold">列表</p>
            <p className="text-gray-500 text-sm ml-3">仅显示今日上传记录</p>
          </div>
        </div>
      </div>
    </div>
  )
}