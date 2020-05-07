Vue.options.delimiters = ['<%', '%>'];

const states = ['login','register','main','messaging'];

let main_app = new Vue({
    el:'#root',
    data:{
        active_state:states[0] 
    },
    methods:{
        change_state_to_reg(){
            this.active_state = states[1]
            let password_validation = new Vue({
                el:'#reg_form',
                data:{
                    pass_rep:document.querySelector('#inputPassword_rep'),
                    pass:document.querySelector('#inputPassword'),
                    small:document.querySelector('small'),
                    form:document.getElementById('reg_form'),
                },
                methods:{
                    check(val){
                        if (val === '' || this.pass.value === ''){
                            if(!this.small.classList.contains('d-none')){
                                this.small.classList.add('d-none')
                            }
                        }else if(this.pass_rep.value != this.pass.value){
                            this.small.classList.remove('d-none','text-success')
                            this.small.classList.add('text-danger')
                            this.small.textContent = 'Пароли не совпадают'
                        }else{
                            this.small.classList.remove('d-none','text-danger')
                            this.small.classList.add('text-success')
                            this.small.textContent = 'Отлично'
                        }
            
                    },
                    prevent(e){
                        e.preventDefault();
                        if(this.pass.value == this.pass_rep.value){
                            this.form.submit()
                        }
                    }
            
                }
            
            })
            
        }
    }


})



