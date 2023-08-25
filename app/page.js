'use client'
import { app_description, app_name } from '@/utils/const';
import { getCurrentDate } from '@/utils/helper';
import Image from 'next/image'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function Page() {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [hasSetting, setHasSetting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null);
  const [url, setUrl] = useState('')
  const [branches, setBranches] = useState(['main', 'master'])
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [token, setToken] = useState('')
  const [branch, setBranch] = useState(branches[0])
  const [vip, setVip] = useState(false)
  const [list, setList] = useState([]);

  useEffect(() => {
    const getSettings = async () => {
      const settings = localStorage.getItem("settings")
      console.log("get settings: ", settings);
      if (settings) {
        const { owner, repo, token, branch } = JSON.parse(settings)
        if (owner && repo) {
          setUrl(`${owner}/${repo}`)
        }
        setOwner(owner)
        setRepo(repo)
        setToken(token)
        setBranch(branch)
        setBranches([branch])
        setHasSetting(true)
      }
    }

    getSettings()
  }, [])

  useEffect(() => {
    if (hasSetting) {
      handleGetBranches()
      getImages()
    }
  }, [hasSetting])

  useEffect(() => {
    if (selectedFile) {
      handleFileUpload()
    }
  }, [selectedFile])

  const handleFileChange = async (event) => {
    let f = event.target.files[0]
    setSelectedFile(f)
  };

  const getImages = async (path) => {
    const toastId = toast.loading('获取图片列表...');
    const res = await fetch(`/api/images?token=${token}&owner=${owner}&repo=${repo}&branch=${branch}&path=${path || ''}`)
    const data = await res.json()
    console.log("getImages data: ", data);
    toast.dismiss(toastId);
    if (data) {
      setVip(data.vip)
      setList(data.list)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedFile.type.startsWith("image")) {
      toast.error("请选择图片")
      return
    }
    console.log("client size: ", selectedFile.size);
    if (!vip && (selectedFile.size > 2 * 1024 * 1024)) {
      toast.error("免费用户最大上传 2mb 图片")
      return
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("最大上传 10mb 图片")
      return
    }

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
      .then(response => response.json())
      .then(result => {
        setUploading(false)
        if (result.message != undefined) {
          toast.error("上传失败: " + result.message)
        } else {
          toast.success("上传成功")
          getImages()
        }
      })
      .catch(error => {
        setUploading(false)
        toast.error("上传失败")
        console.log('error', error)
      })
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
    console.log("handleGetBranches");
    if (token && owner && repo) {
      const URL = `https://api.github.com/repos/${owner}/${repo}/branches`;
      const headers = {
        Accept: 'application/vnd.github+json',
        "Authorization": `Bearer ${token}`,
      };
      const toastId = toast.loading('获取仓库分支列表...');
      const response = await fetch(URL, { headers });
      if (response.status != 200) {
        toast.dismiss(toastId)
        toast.error("token 错误")
        return
      }
      toast.dismiss(toastId)
      const data = await response.json();
      const list = data.map(item => item.name);
      if (list.length > 0) {
        setBranches(list)
        setBranch(list[0])
      }
    }
  }

  const handleSaveSetting = () => {
    const setting_info = {
      owner,
      repo,
      token,
      branch,
    }

    for (const key in setting_info) {
      if (!setting_info[key]) {
        toast.error("请填写完整配置")
        return
      }
    }

    if (hasSetting) {
      setHasSetting(false)
    } else {
      setHasSetting(true)
      // getImages()
    }
    console.log("set settings: ", setting_info);
    localStorage.setItem("settings", JSON.stringify(setting_info));
  }

  const handleDel = async (path1, path2, sha) => {
    console.log("handleDel: ", path1, path2, sha);
    const URL = `https://api.github.com/repos/${owner}/${repo}/contents/images/${path1}/${path2}`;
    const headers = new Headers({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    });
    const body = JSON.stringify({
      message: "delete by https://pic.j20.cc",
      committer: {
        name: "luke_44",
        email: "luke_44@163.com"
      },
      sha: sha,
    });
    if (window.confirm('确认删除?')) {
      const response = await fetch(URL, { method: 'DELETE', headers: headers, body: body, })
      const data = await response.json();
      console.log("del data: ", data);
      if (response.status == 200) {
        toast.success("删除成功")
        getImages(path1)
      } else {
        toast.error("删除失败")
      }
    }
  }
  const handleCopy = (type, info) => {
    let text = info.cdn_url
    if (type == 'markdown') {
      text = `![${info.path}](${info.cdn_url})`
    } else if (type == 'html') {
      text = `<img src="${info.cdn_url}" alt="${info.path}"></img>`
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
    return (
      <div className="bg-white border shadow rounded px-3 py-2 flex-row md:flex items-center">
        <div className="flex items-center">
          <p className='text-gray-600 text-sm'>存储仓库:</p>
          <input
            disabled={hasSetting}
            placeholder='输入 git 仓库链接'
            value={url} onChange={e => setUrl(e.target.value)} onBlur={handleParseGithub}
            type="text" className='border text-gray-600 rounded h-7 px-1 ml-2 focus:outline-none' />
        </div>

        <div className="flex items-center md:ml-2">
          <p className='text-gray-600 text-sm'>token:</p>
          <input
            disabled={hasSetting}
            placeholder='输入具有该仓库读写权限的 token'
            value={token}
            onChange={e => setToken(e.target.value)}
            onBlur={handleGetBranches}
            type="text" className='w-80  border text-gray-600 rounded h-7 px-1 ml-2 focus:outline-none' />
        </div>
        <div className="flex items-center md:ml-2">
          <p className='text-gray-600 text-sm'>分支:</p>
          <select onChange={e => setBranch(e.target.value)} defaultValue={branch} className='border text-gray-600 rounded h-7 px-1 ml-2 focus:outline-none'>
            {branches.map(item => <option value={item} key={item}>{item}</option>)}
          </select>
        </div>
        <div className="flex items-baseline ml-auto">
          <p className='text-gray-500 text-sm'>*数据只会存在本地，请放心使用</p>
          <Link href="/help" className='text-gray-500 text-sm ml-2 underline'>*帮助</Link>

          <button
            className={`${hasSetting ? 'bg-green-300' : 'bg-green-400'} text-white text-sm border rounded px-3 py-1 ml-2`}
            onClick={handleSaveSetting}
          >{hasSetting ? "修 改" : "保 存"}</button>
        </div>
      </div >)
  }

  const renderVip = () => {
    if (!vip) {
      return (
        <>
          <p className="text-gray-500 text-sm ml-3">免费用户仅显示今日上传记录，付费用户支持目录树和删除功能</p>
          <Link href="/help#update" className="text-gray-600 text-sm ml-3 underline cursor-pointer">*去升级</Link>
        </>
      )
    }

    return (
      <p className="text-gray-500 text-sm ml-3">年费用户，到期时间: {vip}</p>
    )
  }

  const renderCopyButton = (title, item) => {
    return (
      <div className="bg-green-400 text-white text-sm border rounded px-3 py-1 cursor-pointer flex items-center" onClick={() => handleCopy(title, item)}>
        <svg t="1691750350692" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4021" width="16" height="16"><path d="M639.9 256.3H192.4c-35.2 0-63.9 28.8-63.9 63.9v575.4c0 35.2 28.8 63.9 63.9 63.9h447.5c35.2 0 63.9-28.8 63.9-63.9V320.2c0-35.1-28.8-63.9-63.9-63.9z m0 639.3H192.4V320.2h447.5v575.4z" p-id="4022" fill="#e6e6e6"></path><path d="M831.6 64.5H384.1c-35.2 0-63.9 28.8-63.9 63.9v63.9h63.9v-63.9h447.5v575.4h-63.9v63.9h63.9c35.2 0 63.9-28.8 63.9-63.9V128.4c0.1-35.1-28.7-63.9-63.9-63.9z" p-id="4023" fill="#e6e6e6"></path></svg>
        <p className='ml-2'>{title}</p>
      </div >
    )
  }

  return (
    <div className="container mx-auto py-5 md:py-10 px-5 md:px-0">
      <Toaster />

      <div className="flex items-baseline mb-3">
        <h3 className='text-2xl non-italic text-gray-700 font-mono'>{app_name}</h3>
        <p className='ml-2 italic text-gray-600'>{app_description}</p>
      </div>

      {renderSetting()}

      <div className="flex-row md:flex mt-3 items-start">
        <div className="bg-white border shadow rounded md:w-1/3">
          <div className="px-3 flex items-baseline border-b py-2">
            <p className="text-gray-700 text-lg font-bold">上传</p>
            <p className="text-gray-500 text-sm ml-3">点击选择图片上传，或者拖动图片上传</p>
          </div>

          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
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

        <div className="bg-white border shadow rounded md:w-2/3 md:ml-5 mt-3 md:mt-0">
          <div className="px-3 flex items-baseline border-b py-2">
            <p className="text-gray-700 text-lg font-bold">列表</p>

            {renderVip()}
          </div>
          <div className='py-2'>
            {list.map((item, index) => {
              return (
                <div key={index}>
                  <div className="flex-row md:flex items-center px-2 mt-1 cursor-pointer" onClick={() => vip && getImages(item.path)}>
                    <Image src={item.fold ? "/assets/folder-open.png" : "/assets/folder.png"} alt="image" width="32" height="32" className="hidden md:block" />
                    <p className="text-gray-500 text-sm ml-0 md:ml-3">{item.path}</p>
                  </div>

                  {item.children.map((child, idx) => {
                    return (<div key={idx} className="pl-4 flex-row md:flex items-center px-2 mt-2">
                      <Image src={`https://wsrv.nl/?w=40&h=40&url=${child.raw_url}`} alt="image" width="32" height="32" className="hidden md:block" />
                      <p className="text-gray-500 text-sm ml-0 md:ml-3">{`${item.path}/${child.path}`}</p>
                      <div className="ml-auto flex items-center">
                        {
                          vip && <div className="bg-red-300 text-white text-sm border rounded px-3 py-1 cursor-pointer flex items-center" onClick={() => handleDel(item.path, child.path, child.sha)}>
                            <svg t="1691859359859" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="30152" width="16" height="16"><path d="M938.666667 204.8H85.333333a34.133333 34.133333 0 0 1 0-68.266667h853.333334a34.133333 34.133333 0 0 1 0 68.266667z" p-id="30153" fill="#ffffff"></path><path d="M768 955.733333H256c-66.030933 0-102.4-36.369067-102.4-102.4V170.666667a17.066667 17.066667 0 0 1 34.133333 0v682.666666c0 47.223467 21.0432 68.266667 68.266667 68.266667h512c47.223467 0 68.266667-21.0432 68.266667-68.266667V170.666667a17.066667 17.066667 0 1 1 34.133333 0v682.666666c0 66.030933-36.369067 102.4-102.4 102.4z m-85.333333-170.666666a17.066667 17.066667 0 0 1-17.066667-17.066667V341.333333a17.066667 17.066667 0 1 1 34.133333 0v426.666667a17.066667 17.066667 0 0 1-17.066666 17.066667z m-169.813334 0a17.066667 17.066667 0 0 1-17.066666-17.066667V341.333333a17.066667 17.066667 0 0 1 34.133333 0v426.666667a17.066667 17.066667 0 0 1-17.066667 17.066667zM341.333333 785.066667a17.066667 17.066667 0 0 1-17.066666-17.066667V341.333333a17.066667 17.066667 0 0 1 34.133333 0v426.666667a17.066667 17.066667 0 0 1-17.066667 17.066667z m256-597.333334a17.066667 17.066667 0 0 1-17.066666-17.066666V102.4h-136.533334v68.266667a17.066667 17.066667 0 0 1-34.133333 0V85.333333a17.066667 17.066667 0 0 1 17.066667-17.066666h170.666666a17.066667 17.066667 0 0 1 17.066667 17.066666v85.333334a17.066667 17.066667 0 0 1-17.066667 17.066666z" p-id="30154" fill="#ffffff"></path></svg>
                            <p className='ml-2'>删除</p>
                          </div >
                        }
                        <p className="w-2"></p>
                        {renderCopyButton("url", child)}
                        <p className="w-2"></p>
                        {renderCopyButton("html", child)}
                        <p className="w-2"></p>
                        {renderCopyButton("markdown", child)}
                      </div>
                    </div>)
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}