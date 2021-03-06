/*
  聊天室的主要功能
*/
/*
  1. 连接socketio服务
*/
var socket = io('http://localhost:3000')
var username, avatar
/*
  2. 登录功能
*/
$('#login_avatar li').on('click', function() {
    $(this)
        .addClass('now')
        .siblings()
        .removeClass('now')
})
// 点击按钮，登录
$('#loginBtn').on('click', function() {
    // 获取用户名
    var username = $('#username')
        .val()
        .trim()
    if (!username) {
        alert('请输入用户名')
        return
    }
    // 获取选择的头像
    var avatar = $('#login_avatar li.now img').attr('src')

    // 需要告诉socket io服务，登录
    socket.emit('login', {
        username: username,
        avatar: avatar
    })
})

// 监听登录失败的请求
socket.on('loginError', data => {
    alert('用户名已经存在')
})
// 监听登录成功的请求
socket.on('loginSuccess', data => {
    // 需要显示聊天窗口
    // 隐藏登录窗口
    $('.login_box').fadeOut()
    $('.container').fadeIn()
    // 设置个人信息
    console.log(data)
    $('.avatar_url').attr('src', data.avatar)
    $('.user-list .username').text(data.username)

    username = data.username
    avatar = data.avatar
})

// 监听添加用户的消息
socket.on('addUser', data => {
    // 添加一条系统消息
    $('.box-bd').append(`
    <div class="system">
      <p class="message_system">
        <span class="content">${data.username}加入了群聊</span>
      </p>
    </div>
  `)
    scrollIntoView()
})

// 监听用户列表的消息
socket.on('userList', data => {
    // 把userList中的数据动态渲染到左侧菜单
    $('.user-list ul').html('')
    data.forEach(item => {
        $('.user-list ul').append(`
      <li class="user">
        <div class="avatar"><img src="${item.avatar}" alt="" /></div>
        <div class="name">${item.username}</div>
      </li>      
    `)
    })

    $('#userCount').text(data.length)
})

// 监听用户离开的消息
socket.on('delUser', data => {
    // 添加一条系统消息
    $('.box-bd').append(`
    <div class="system">
      <p class="message_system">
        <span class="content">${data.username}离开了群聊</span>
      </p>
    </div>
  `)
    scrollIntoView()
})

// 聊天功能
$('.btn-send').on('click', () => {
    // 获取到聊天的内容
    var content = $('#content').html()
    $('#content').html('')
    if (!content) return alert('请输入内容')

    // 发送给服务器
    socket.emit('sendMessage', {
        msg: content,
        username: username,
        avatar: avatar
    })
})

// 监听聊天的消息
socket.on('receiveMessage', data => {
    // 把接收到的消息显示到聊天窗口中
    if (data.username === username) {
        // 自己的消息
        $('.box-bd').append(`
      <div class="message-box">
        <div class="my message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">${data.msg}</div>
            </div>
          </div>
        </div>
      </div>
    `)
    } else {
        // 别人的消息
        $('.box-bd').append(`
      <div class="message-box">
        <div class="other message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="nickname">${data.username}</div>
            <div class="bubble">
              <div class="bubble_cont">${data.msg}</div>
            </div>
          </div>
        </div>
      </div>
    `)
    }
    scrollIntoView()
})

function scrollIntoView() {
    // 当前元素的底部滚动到可视区
    $('.box-bd')
        .children(':last')
        .get(0)
        .scrollIntoView(false)
}