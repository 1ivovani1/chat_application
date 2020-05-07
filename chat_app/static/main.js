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
    },
    methods:{
        login:function(){
            const params = new URLSearchParams();
            params.append('username', this.login_form.login);
            params.append('password', this.login_form.password);
            axios.post('/api/login', params)
              .then(function(response){
                if (response.status !== 200){
                  throw new Error('Статус не 200')
                }
                let token = response.data.token;
                localStorage.setItem('token',token)
                this.login_form.login = '';
                this.login_form.password = '';
                alert(`Уважаемый,${response.data.username},вы успешно вошли в систему!`)
                // this.active_state = 'main'
                
              })
              .catch(function(error) {
                alert(`Вы не вошли в систему,потому что ${error}`)
                console.log(error);
              });
        },
        register:() => {

        }
    }


})



