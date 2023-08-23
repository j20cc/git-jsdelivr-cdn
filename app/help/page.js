export default function Page() {

  return (
    <div className="container mx-auto py-10">
      <article className="prose lg:prose-xl">
        <h3>使用方法</h3>
        <p>1. 创建一个公共仓库，假如叫 <b>yourname/yourrepo</b> </p>
        <p>2. 去 <a href="https://github.com/settings/personal-access-tokens/new" target="_blank">github</a> 创建一个仓库级别的 token，需要对上面的仓库 content 具有读写权限 </p>
        <img src="https://cdn.jsdelivr.net/gh/j20cc/scripts@master/images/20230823/29811_iShot_2023-08-22_22.15.06.png" alt="29811_iShot_2023-08-22_22.15.06.png"></img>
        <img src="https://cdn.jsdelivr.net/gh/j20cc/scripts@master/images/20230823/66573_iShot_2023-08-22_22.36.24.png" alt="66573_iShot_2023-08-22_22.36.24.png"></img>
        <p>3. 填入仓库名称和 token，开始使用 </p>
        <img src="https://cdn.jsdelivr.net/gh/j20cc/scripts@master/images/20230821/60755_iShot_2023-08-21_21.32.35.png" alt="image"></img>
      </article>

      <article className="mt-10 prose lg:prose-xl">
        <h3>付费解锁高级功能</h3>
        <p>1. 免费用户只能上传图片，最大上传 2mb 图片，仅能获取当天上传记录</p>
        <p>2. 付费用户支持目录树和删除功能，图片尺寸无限制，价格：30 元/年，50 元/终身</p>
        <p>3. 向我微信或支付宝转账时，请备注: <b>你的 github 用户名和邮箱</b>，开通后您会收到我的确认邮件</p>
        <img src="https://cdn.jsdelivr.net/gh/j20cc/scripts@master/images/20230821/15102_WechatIMG7502.jpg" alt="image"></img>
        <i>*左边为微信，右边为支付宝</i>
      </article>
    </div>
  )
}