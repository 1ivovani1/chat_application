Vue.options.delimiters = ['<%', '%>'];

let main_app = new Vue({
    el:'#root',
    data:{
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
        }


    },
    methods:{
        login:function(){
            let socket = io.connect('http://localhost');
            socket.emit('login_server', { data: {'username':this.login_form.login,'password':this.login_form.password} });

            socket.on('get_login_response',function(data){
                console.log(data)
            })


            // const params = new URLSearchParams(),
            //       self = this;
            // params.append('username', self.login_form.login);
            // params.append('password', self.login_form.password);
            // axios.post('/api/login', params)
            //   .then(function(response){
                
            //     let token = response.data.token;
            //     localStorage.setItem('token',token)
            //     self.login_form.login = '';
            //     self.login_form.password = '';
            //     alert(`Уважаемый,${response.data.username},вы успешно вошли в систему!`)
            //     self.active_state = 'user-list'
            //     self.load_users()
                
            //   })
            //   .catch(function(error) {
            //     self.login_form.login = '';
            //     self.login_form.password = '';
            //     alert(`Вы не вошли в систему,потому что \n ${error}`)
            //     console.log(error);
            //   });
        },
        register:function() {
          const params = new URLSearchParams(),
          self = this;
          params.append('username', self.register_form.login);
          params.append('password', self.register_form.password);
          axios.post('/api/register', params)
            .then(function(response){
             
              let token = response.data.token;
              localStorage.setItem('token',token)
              self.register_form.login = '';
              self.register_form.password = '';
              alert(`Уважаемый,${response.data.username},вы успешно зарегистрировались в системе!`)
              self.active_state = 'user-list'
              self.load_users()
            })
            .catch(function(error) {
              self.register_form.login = '';
              self.register_form.password = '';
              alert(`Вы не вошли в систему,потому что \n ${error}`)
              console.log(error);
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
          let self = this;
          params = new URLSearchParams();
          params.append('user_id',id)
          params.append('msg',self.current_user.active_message)
          self.current_user.active_message = ''
          axios.post('/api/send_message',params,
          {
            headers:{
              'Authorization':'Token ' + localStorage.getItem('token')
            }
          })
          .then(function(response){
            if(response.status === 200){
              alert('Сообщение отправлено!')
            }

          })
          .catch(function(error){
            console.error(error)
            alert(error)
          })


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

          })
          .catch(function(error){
            console.error(error)
            alert(error)
          })

        }

    },
    mounted(){
      if(localStorage.getItem('token') !== null){
        this.active_state = 'user-list'
        this.load_users()
      }else{
        this.active_state = 'login'
      }

    },


})

