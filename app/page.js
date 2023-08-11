'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function Page() {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [hasSetting, setHasSetting] = useState(false)
  const [images, setImages] = useState([]);
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
      console.log("get settings: ", settings);
      if (settings) {
        const { owner, repo, token, branch, sha } = JSON.parse(settings)
        setUrl(`${owner}/${repo}`)
        setOwner(owner)
        setRepo(repo)
        setToken(token)
        setBranch(branch)
        setBranches([branch])
        setSha(sha)
        setHasSetting(true)
      }
    }

    getSettings()
  }, [])

  useEffect(() => {

    if (token && owner && repo) {
      getImages()
    }
  }, [token])

  useEffect(() => {
    if (sha) {
      handleSave()
    }
  }, [sha])


  useEffect(() => {
    if (selectedFile) {
      handleFileUpload()
    }
  }, [selectedFile])

  const handleFileChange = async (event) => {
    let f = event.target.files[0]
    setSelectedFile(f)
  };

  const getImages = async () => {
    const res = await fetch(`/api/images?token=${token}&owner=${owner}&repo=${repo}&branch=${branch}`)
    const data = await res.json()
    console.log("getImages data: ", data);
    if (data.sha1) {
      setSha(data.sha1)
      setImages(data.list)
    }
  }

  const handleFileUpload = async () => {
    setUploading(true)
    let formdata = new FormData();
    formdata.append("token", token);
    formdata.append("file", selectedFile);
    formdata.append("owner", owner);
    formdata.append("repo", repo);
    formdata.append("branch", branch);

    const requestOptions = {
      method: 'POST',
      body: formdata,
    };

    fetch("/api/upload", requestOptions)
      .then(response => response.text())
      .then(result => {
        console.log(result)
        setUploading(false)
        getImages()
        toast.success("上传成功")
      })
      .catch(error => {
        toast.error("上传失败")
        console.log('error', error)
        setUploading(false)
      });
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
    console.log("set settings: ", setting_info);
    localStorage.setItem("settings", JSON.stringify(setting_info));
  }

  const handleCopy = (type, info) => {
    let text = info.cdn_url
    if (type == 'markwdown') {
      text = `![${info.name}](${info.cdn_url})`
    } else if (type == 'html') {
      text = `<img src="${info.cdn_url}" alt="${info.name}" width="100" height="100"></img>`
    }
    var textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    // 隐藏此输入框
    textarea.style.position = 'fixed';
    textarea.style.clip = 'rect(0 0 0 0)';
    textarea.style.top = '10px';
    // 赋值
    textarea.value = text;
    // 选中
    textarea.select();
    // 复制
    document.execCommand('copy', true);
    // 移除输入框
    document.body.removeChild(textarea);
    toast.success("复制成功")
  }

  const renderSetting = () => {
    return (<div className="bg-white border shadow rounded px-3 py-2 flex items-center">
      <div className="flex items-center">
        <p className='text-gray-600 text-sm'>存储仓库:</p>
        <input
          placeholder='输入 git 仓库链接'
          value={url} onChange={e => setUrl(e.target.value)} onBlur={handleParseGithub}
          type="text" className='border text-gray-600 rounded h-7 px-1 ml-2 focus:outline-none' />
      </div>

      <div className="flex items-center ml-2">
        <p className='text-gray-600 text-sm'>token:</p>
        <input placeholder='输入具有该仓库读写权限的 token' value={token} onChange={e => setToken(e.target.value)} onBlur={handleGetBranches} type="text" className='w-80  border text-gray-600 rounded h-7 px-1 ml-2 focus:outline-none' />
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

        <button
          className={`${hasSetting ? 'bg-green-300' : 'bg-green-400'} text-white text-sm border rounded px-3 py-1 ml-2`}
          onClick={handleSave}
        >{hasSetting ? "已保存" : "保 存"}</button>
      </div>
    </div >)
  }

  const renderCopyButton = (title, item) => {
    return (
      <div className="bg-green-400 text-white text-sm border rounded px-3 py-1 cursor-pointer flex items-center" onClick={() => handleCopy(title, item)}>
        <svg t="1691750350692" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4021" width="16" height="16"><path d="M639.9 256.3H192.4c-35.2 0-63.9 28.8-63.9 63.9v575.4c0 35.2 28.8 63.9 63.9 63.9h447.5c35.2 0 63.9-28.8 63.9-63.9V320.2c0-35.1-28.8-63.9-63.9-63.9z m0 639.3H192.4V320.2h447.5v575.4z" p-id="4022" fill="#e6e6e6"></path><path d="M831.6 64.5H384.1c-35.2 0-63.9 28.8-63.9 63.9v63.9h63.9v-63.9h447.5v575.4h-63.9v63.9h63.9c35.2 0 63.9-28.8 63.9-63.9V128.4c0.1-35.1-28.7-63.9-63.9-63.9z" p-id="4023" fill="#e6e6e6"></path></svg>
        <p className='ml-2'>{title}</p>
      </div >
    )
  }

  // https://api.github.com/repos/tw93/Maple/branches
  return (
    <div className="container mx-auto py-10">
      <Toaster />
      {renderSetting()}

      <div className="flex mt-3 items-start">
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
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {
              <p className="text-gray-500 text-sm mt-5 text-center">{uploading ? `正在上传: ${selectedFile.name}` : '选择图片'}</p>
            }
          </div>
        </div>

        <div className="bg-white border shadow rounded w-2/3 ml-5">
          <div className="px-3 flex items-baseline border-b py-2">
            <p className="text-gray-700 text-lg font-bold">列表</p>
            <p className="text-gray-500 text-sm ml-3">仅显示今日上传记录</p>
          </div>
          <div>
            {images.map((item, index) => {
              return (
                <div key={index} className="flex items-center px-2 mt-1">
                  <Image src={item.cdn_url} alt="image" width="48" height="48" className="" />
                  <p className="text-gray-500 text-sm ml-3">{item.name}</p>
                  <div className="ml-auto flex items-center">
                    {renderCopyButton("url", item)}
                    <p className="w-2"></p>
                    {renderCopyButton("html", item)}
                    <p className="w-2"></p>
                    {renderCopyButton("markwdown", item)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}