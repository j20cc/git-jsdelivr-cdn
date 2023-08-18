// import HelloWorld from '../../doc/hello.mdx'

// export default function Page() {
//   return <HelloWorld />
// }

// import { MDXRemote } from 'next-mdx-remote/rsc'
import matter from 'gray-matter';
import path from 'path'
import fs from 'fs'

export default function Page() {
  const filePath = path.join(process.cwd(), '/doc/hello.md');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);
  console.log(data, content);
  return (
    <article className="prose lg:prose-xl">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  )
}