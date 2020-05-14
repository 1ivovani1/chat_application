Vue.options.delimiters = ['<%', '%>'];

let main_app = new Vue({
    el:'#root',
    data:{
        user_id:'',
        username:'',
        audio:'',
        interval:'',
        pc:'',
        active_state:'login',
        register_form:{
            login:'',
            password:''
        },
        login_form:{
            login:"",
            password:''
        },
        working_with_users:{
          users_to_show:[],
          load_more:false,
          last_loaded_index:0,
          search_req:'',
        },
        current_user:{
          id:'',
          requests:[],
          friends:[],
          is_any_friends:false,
          is_any_requests:false,
          whom_messaging:{},
          active_message:'',
          history:[]
        },
        connection:'',
        video_calls:{
          i_call:false,
          is_calling:false,
          username:null,
          user_id:null,
        }
        

    },
    methods:{
        login:function(){   
          this.connection.send(JSON.stringify({logging:'',login:this.login_form.login,password:this.login_form.password}))
        },
        register:function() {
          this.connection.send(JSON.stringify({register:'',login:this.register_form.login,password:this.register_form.password}))
        },
        load_users:function(){
              const self = this,
                    params = new URLSearchParams();
              params.append('last_loaded_index',self.working_with_users.last_loaded_index)
              axios.post('/api/load_users',params,
              {
                headers:{
                  'Authorization':'Token ' + localStorage.getItem('token')
                }
              })
              .then(function(response){
                
              
                if (response.data.requests.length != 0){
                  self.current_user.requests = response.data.requests
                  self.current_user.is_any_requests = true  
                }

                if (response.data.friends.length != 0){
                  self.current_user.friends = response.data.friends
                  self.current_user.is_any_friends = true
                }

                self.working_with_users.last_loaded_index += response.data['length']
                response.data.users.forEach((item) => {
                  self.working_with_users.users_to_show.push(item)
                })
                
                let real_len = response.data['real_length']
                if (real_len > self.working_with_users.last_loaded_index){
                  self.working_with_users.load_more = true
                }else{
                  self.working_with_users.load_more = false
                }

              })
              .catch(function(error) {
                console.error(error);
                self.active_state = 'login'
                localStorage.clear()
                alert(error)
              });

            

        },
        search_users:function(){
          if(this.working_with_users.search_req !== ''){
          const self = this,
          params = new URLSearchParams();
          self.working_with_users.load_more = false
          params.append('query',self.working_with_users.search_req)
          axios.post('/api/search_users',params,
          {
            headers:{
              'Authorization':'Token ' + localStorage.getItem('token')
            }
          })
          .then(function(response){
              let users = Array.from(response.data.search_users)
              if(users.length !== 0){
                self.working_with_users.users_to_show = users
              }

          })
          .catch(function(error){
              console.error(error)
              self.active_state = 'login'
              alert(error)
          })
          }else{
            this.working_with_users.users_to_show = []
            this.working_with_users.last_loaded_index = 0
            this.load_users()
          }
        },
        send_friend_request:function(id){
          const self = this,
          params = new URLSearchParams();
          params.append('user_id',id)
          axios.post('/api/send_friend_request',params,
          {
            headers:{
              'Authorization':'Token ' + localStorage.getItem('token')
            }
          })
          .then(function(response){
            if(response.status === 200){
              alert(`Запрос дружбы к ${response.data.username} успешно отправлен!`)
              
            }
          })
          .catch(function(error){
            console.error(error)
            self.active_state = 'login'
            alert(error)
          })
          
        },
        accept_friend_request:function(id){
          const self = this,
          params = new URLSearchParams();
          params.append('user_id',id)
          axios.post('/api/accept_friend_request',params,
          {
            headers:{
              'Authorization':'Token ' + localStorage.getItem('token')
            }
          })
          .then(function(response){
            if (response.status === 200){
              alert(`Вы добавили в друзья ${response.data.user_to_add}`)
            }
          })
          .catch(function(error){
            console.error(error)
            self.active_state = 'login'
            alert(error)
          })
        },
        deny_friend_request:function(id){
          let self = this;
          params = new URLSearchParams();
          params.append('user_id',id)
          axios.post('/api/deny_friend_request',params,
          {
            headers:{
              'Authorization':'Token ' + localStorage.getItem('token')
            }
          })
          .then(function(response){
            if (response.status === 200){
              alert(`Вы удалили ${response.data.user_to_remove}`)
            }
          })
          .catch(function(error){
            console.error(error)
            self.active_state = 'login'
            alert(error)
          })
        },
        send_message:function(id){
          let data = {
            'token':localStorage.getItem('token'),
            'user_id':id,
            'msg':this.current_user.active_message,
            'sending_message':''
          }

          this.connection.send(JSON.stringify(data))
          this.current_user.active_message = '';
          


        },
        change_state_to_messaging:function(id){
          let self = this;
          params = new URLSearchParams();
          params.append('user_id',id)
          axios.post('/api/get_user_messages',params,
          {
            headers:{
              'Authorization':'Token ' + localStorage.getItem('token')
            }
          })
          .then(function(response){
              self.active_state = 'writting-message';
              self.current_user.whom_messaging = response.data
              self.current_user.id = response.data.request_user_id
              self.current_user.history = response.data.history
              
              setTimeout(()=> {
                location.href = '#bottom'
              },0)
          })
          .catch(function(error){
            console.error(error)
            alert(error)
          })

        },
        start_call:function(id){
          const self = this;
          self.video_calls.is_calling = true
          self.video_calls.i_call = true

          self.connection.send(JSON.stringify({
            my_id:self.user_id,
            user_id:id,
            username:self.username,
            start_call:null
          }))

        },
        deny_call:function(id){
          const self = this;
          self.video_calls.is_calling = false
          self.audio.pause()
          clearInterval(self.interval)
        
          self.connection.send(JSON.stringify({
            user_id:id,
            username:self.username,
            deny_call:null
          }))

        },
        accept_call:function(id){
          const self = this;
          self.video_calls.is_calling = false
          self.audio.pause()
          clearInterval(self.interval)
        

          self.connection.send(JSON.stringify({
            user_id:id,
            username:self.username,
            accept_call:null
          }))

        }

    },
    mounted(){
      let self = this
      
      self.connection = new WebSocket('ws://192.168.0.105:1337');
  
      self.connection.onopen = function(){
        console.log('success connection')
        if(localStorage.getItem('token') !== null){
          self.active_state = 'user-list'
          self.load_users()
          self.connection.send(JSON.stringify({check:'',token:localStorage.getItem('token')}))
        }
      }
      
      self.connection.onerror = function (error) {
        console.error(error)
      };
      
      self.connection.onmessage = function(message){
          
        let data = JSON.parse(message.data)
        
        
        if(data.hasOwnProperty("success_send")){
          if (data.success_send == true){
            self.current_user.history.push(data.message)
            location.href = '#bottom';
          }else{
            alert('Cообщение не отправлено')
          }
        }
        if(data.hasOwnProperty("check")){
          if(data.status === 200){
            self.user_id = data.user_id
            self.username = data.username
            
            alert('С возращением!')
          }else{
            localStorage.clear()
            self.connection.close()
            alert('Вас нет в системе,поэтому вам придется зайти по-новой!')
          }
        }
        if(data.hasOwnProperty("logging")){
          
          if(data.status === 200){
            alert(`Уважаемый,${data.username},вы успешно вошли в систему!`)
            self.login_form.login = '';
            self.login_form.password = '';
  
            let token = data.token;
            localStorage.setItem('token',token)
            self.user_id = data.user_id
            self.my_username = data.username

            self.active_state = 'user-list'
            self.load_users()
        }else{
          localStorage.clear()
          alert('Вас нет в системе,поэтому лучше зарегистрируйтесь!')
          self.login_form.login = '';
          self.login_form.password = '';
            
        }
        }
        if(data.hasOwnProperty("register")){
          if(data.status === 200){

            alert(`Уважаемый,${data.username},вы успешно зарегистрировались в системе!`)
            self.register_form.login = '';
            self.register_form.password = '';
        
            let token = data.token;
            localStorage.setItem('token',token)
            self.user_id = data.user_id

            self.username = data.username
            self.active_state = 'user-list'
            self.load_users()
        
           }else{
            alert(`Вы не зарегистрировались!`)
          }
        }
        if(data.hasOwnProperty('calling')){
          if(data.status === 200){
              let audio = new Audio();
              self.audio = audio
              audio.src = '../static/zvonok.mp3'
              audio.play()
              let repeat = setInterval(()=>{
                audio.play()
              },9000)
              self.interval = repeat
              let id = data.my_id,
                  username = data.username;
              self.video_calls.is_calling = true;
              self.video_calls.username = username;
              self.video_calls.user_id = id
            
          }else{
            self.video_calls.is_calling = false
            alert('Не удалось дозвониться!')
          }
        }
        if(data.hasOwnProperty('offer')){
          if(data.offer != null){
            var pc = new RTCPeerConnection();
            self.pc = pc
            var peerConnectionConfig = {
              iceServers: [
                  {
                      urls: 'stun:stun.l.google.com:19302'
                  }
                ]
            }
            self.pc.onicecandidate = function (event) {
              console.log('new ice candidate', event.candidate);

              if (event.candidate !== null) {
                self.connection.send(JSON.stringify({
                  ice: event.candidate,
                  id:self.current_user.whom_messaging.id
                }))
              }
          };

            self.current_user.whom_messaging.id = data.other_id

            navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

            navigator.getUserMedia({video: true,audio:true}, function(stream) {
              var my_video = document.getElementById('my')
              my_video.srcObject = stream
              console.log('stream is added while offering')

              self.pc.onaddstream = e => {
                console.log('not my stream is added while offering')
                document.getElementById('not_my').srcObject = e.stream;
                
              }
              self.pc.addStream(stream);
            
              self.pc.setRemoteDescription(new RTCSessionDescription(data.offer), function() {
                self.pc.createAnswer(function(answer) {
                  self.pc.setLocalDescription(answer, function() {
                    self.connection.send(JSON.stringify({
                      answer:answer,
                      id:self.current_user.whom_messaging.id
                    }))
                  }, e => console.log(e));
                }, e => console.log(e));
              }, e => console.log(e));
            },function (){console.warn("Error getting audio stream from getUserMedia")});
          }
        }

        if(data.hasOwnProperty('answer')){
            self.pc.setRemoteDescription(new RTCSessionDescription(data.answer), function() { }, error);
          
        }

        if(data.hasOwnProperty('ice')){
          let ice = data.ice
          self.pc.addIceCandidate(new RTCIceCandidate(ice))
          
        }

        if(data.hasOwnProperty('accepting')){
          if(data.status === 200){
            console.log(self.current_user.whom_messaging);
            self.video_calls.is_calling = false
            var pc = new RTCPeerConnection();
            self.pc = pc
            
            var peerConnectionConfig = {
              iceServers: [
                  {
                      urls: 'stun:stun.l.google.com:19302'
                  }
                ]
            }
            self.pc.onicecandidate = function (event) {
              console.log('new ice candidate', event.candidate);

              if (event.candidate !== null) {
                self.connection.send(JSON.stringify({
                  ice: event.candidate,
                  id:self.current_user.whom_messaging.id
                }))
              }
          };

            navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;
                      

            navigator.getUserMedia({video: true,audio:true}, function(stream) {
              // Добавление локального потока не вызовет onaddstream обратного вызова,
              // так называют его вручную.
            var my_video = document.getElementById('my')
            my_video.srcObject = stream

              self.pc.onaddstream = e => {
                document.getElementById('not_my').srcObject = e.stream;
                console.log('not stream is added')
              }
              self.pc.addStream(stream);   
            
              self.pc.createOffer(function(offer) {
                self.pc.setLocalDescription(offer, function() {
                  // send the offer to a server to be forwarded to the friend you're calling.
                  self.connection.send(JSON.stringify({
                    offer:offer,
                    id:self.current_user.whom_messaging.id,
                    my_id:self.user_id
                  }))
                }, e=> console.log(e));
              }, e=> console.log(e));
            },function (){console.warn("Error getting audio stream from getUserMedia")});

            // функция помощник
            function endCall() {
              var videos = document.getElementsByTagName("video");
              for (var i = 0; i < videos.length; i++) {
                videos[i].pause();
              }
            
              self.pc.close();
            }

            function error(err) {
              endCall();
            }

          }else{
            self.video_calls.is_calling = false
            alert('Не удалось дозвониться')
          }
        }
        if(data.hasOwnProperty('denying')){
          if(data.status === 200){
            self.video_calls.is_calling = false
            self.video_calls.i_call = false
            alert('Занято')
          }else{
            self.video_calls.is_calling = false
            alert('Не удалось дозвониться')
          }
        }
    }

      
    },
  
})

