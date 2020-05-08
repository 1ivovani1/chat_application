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
        users:[]
    },
    mounted: function(){
      this.check_token()
    },
    methods:{
        check_token(){
          if(localStorage.getItem('token') !== null){
              this.active_state = 'main'
              this.load_users()
          }else{
            this.active_state = 'login'
          }

        },
        login:function(){
            
            const params = new URLSearchParams(),
                  self = this;
            params.append('username', self.login_form.login);
            params.append('password', self.login_form.password);
            axios.post('/api/login', params)
              .then(function(response){
                if (response.status !== 200){
                  throw new Error(response.data.error)
                }
                let token = response.data.token;
                localStorage.setItem('token',token)
                self.login_form.login = '';
                self.login_form.password = '';
                alert(`Уважаемый,${response.data.username},вы успешно вошли в систему!`)
                self.active_state = 'main'
                this.load_users()
                
              })
              .catch(function(error) {
                self.login_form.login = '';
                self.login_form.password = '';
                alert(`Вы не вошли в систему,потому что \n ${error}`)
                console.log(error);
              });
        },
        register:function() {
          const params = new URLSearchParams(),
          self = this;
          params.append('username', self.register_form.login);
          params.append('password', self.register_form.password);
          axios.post('/api/register', params)
            .then(function(response){
              if (response.status !== 200){
                throw new Error(response.data.error)
              }
              let token = response.data.token;
              localStorage.setItem('token',token)
              self.register_form.login = '';
              self.register_form.password = '';
              alert(`Уважаемый,${response.data.username},вы успешно зарегистрировались в системе!`)
              self.active_state = 'main'
              this.load_users()
            })
            .catch(function(error) {
              self.register_form.login = '';
              self.register_form.password = '';
              alert(`Вы не вошли в систему,потому что \n ${error}`)
              console.log(error);
            });
        },
        load_users:function(){

              let self = this
              axios.post('/api/load_users',{},{
                headers:{
                  'Authorization':localStorage.getItem('token')
                }
              })
              .then(function(response){
                if (response.status !== 200){
                  throw new Error(response.data.error)
                }

                let data = response.data
                console.log(data)
                

              })
              .catch(function(error) {
                alert(error)
                console.log(error);
              });

            

        }


    }


})

