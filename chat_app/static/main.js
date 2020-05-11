Vue.options.delimiters = ['<%', '%>'];

let main_app = new Vue({
    el:'#root',
    data:{
        user_id:'',
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
        connection:''


    },
    methods:{
        login:function(){
          let self = this;    
          self.connection.send(JSON.stringify({logging:'',login:self.login_form.login,password:self.login_form.password}))
        },
        register:function() {
          self.connection.send(JSON.stringify({register:'',login:self.register_form.login,password:self.register_form.password}))
        
          const params = new URLSearchParams(),
          self = this;
          params.append('username', self.register_form.login);
          params.append('password', self.register_form.password);
          axios.post('/api/register', params)
            .then(function(response){
             
              let token = response.data.token;
              localStorage.setItem('token',token)
             
              alert(`Уважаемый,${response.data.username},вы успешно зарегистрировались в системе!`)
              self.active_state = 'user-list'
              self.load_users()
            })
            .catch(function(error) {
              alert(`Вы не зарегистрировались,потому что \n ${error}`)
            });
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

        }

    },
    mounted(){
      let self = this
      
      self.connection = new WebSocket('ws://127.0.0.1:1337');
  
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
            alert('Добро пожаловать!')
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
        
            self.active_state = 'user-list'
            self.load_users()
         

            let token = data.token;
            localStorage.setItem('token',token)

           }else{
            alert(`Вы не зарегистрировались!`)
          }
        }

    }

      
    },


})

