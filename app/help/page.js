import { MDXRemote } from 'next-mdx-remote/rsc'
import path from 'path'
import fs from 'fs'

export default async function Page() {
  const filePath = path.join(process.cwd(), '/doc/help.md');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const markdown = fileContent.toString();
  return (
    <div className="container mx-auto py-10">
      <article className="prose lg:prose-xl">
        <MDXRemote source={markdown} />
      </article>
    </div>
  )
}