'use client'
import Image from 'next/image'
import { useState } from 'react';

export default function Page() {
  const handleFileChange = async (event) => {
    let f = event.target.files[0]
    const base64 = await toBase64(f);
    console.log("selectedFile", base64);
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
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

  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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

  const [url, setUrl] = useState('')
  const [branches, setBranches] = useState(['master'])

  const handleParseGithub = () => {
    const info = parseRepoUrl(url);
    if (info) {
      const owner_repo = `${info.owner}/${info.repo}`
      setUrl(owner_repo)
      fetch(`https://api.github.com/repos/${owner_repo}/branches`)
        .then(response => response.json())
        .then(json => {
          // const list = json.map(item => item.name)
          console.log(json);
        })
        .catch(err => console.log('Request Failed', err));
    }
  }

  // https://api.github.com/repos/tw93/Maple/branches
  return (
    <div className="container mx-auto py-10">
      <div className="bg-white border shadow rounded px-3 py-2 flex items-center">
        <div className="flex items-center">
          <p className='text-gray-600 text-sm'>存储仓库:</p>
          <input
            value={url} onChange={e => setUrl(e.target.value)} onBlur={handleParseGithub}
            type="text" className='border text-gray-600 rounded h-7 px-1 ml-2 focus:outline-none' />
        </div>

        <div className="flex items-center ml-2">
          <p className='text-gray-600 text-sm'>token:</p>
          <input type="text" className='w-80  border text-gray-600 rounded h-7 px-1 ml-2 focus:outline-none' />
        </div>
        <div className="flex items-center ml-2">
          <p className='text-gray-600 text-sm'>分支:</p>
          <select defaultValue={"dev"} className='border text-gray-600 rounded h-7 px-1 ml-2 focus:outline-none'>
            <option value="master">master</option>
            <option value="dev">dev</option>
          </select>
        </div>
        <div className="flex items-baseline ml-auto">
          <p className='text-gray-500 text-sm'>*数据只会存在本地，请放心使用</p>
          <p className='text-gray-500 text-sm ml-2'>*帮助</p>
          <button className='bg-green-300 text-white text-sm border rounded px-3 py-1 ml-2'>保 存</button>
        </div>
      </div>
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