const WebSocketServer = require('websocket').server;
const http = require('http');
const axios = require('axios').default;

const server = http.createServer(function(request, response) {
  // process HTTP request. Since we're writing just WebSockets
  // server we don't have to implement anything.
});
server.listen(1337, function() {});

// create the server
const wsServer = new WebSocketServer({
  httpServer: server
});

let connections = [],
    calls = []


// WebSocket server
wsServer.on('request', function(request) {
  let connection = request.accept(null, request.origin);

  connection.on('message', function(message) {
    let self = JSON.parse(message.utf8Data);
    
    if('check' in self){
      params = new URLSearchParams();
      params.append('token',self.token)
      axios.post('http://localhost:5000/api/check_user',params,)
      .then(function(response){
          if(response.status === 200){
            connections.push({
                'connection':connection,
                'user_id':response.data.user_id
            })
            connection.send(JSON.stringify({
              'status':200,
              'user_id':response.data.user_id,
              'check':'',
              'username':response.data.username
            }))
          }
      })
      .catch(function(error){
        connection.send(JSON.stringify({
          'status':404,
          'check':''
        }))
      })

    }
    if('sending_message' in self){
      params = new URLSearchParams();
      params.append('user_id',self.user_id)
      params.append('msg',self.msg)
      axios.post('http://localhost:5000/api/send_message',params,
      {
        headers:{
          'Authorization':'Token ' + self.token
        }
      })
      .then(function(response){
        if(response.status === 200){
            connection.send(JSON.stringify({
              'success_send':true,
              'message':response.data
            }))  
            connections.forEach(conn => {
                if(self.user_id == conn.user_id){
                  conn.connection.send(JSON.stringify({
                    'success_send':true,
                    'message':response.data
                  }))
                }
            })
              
        }

      })
      .catch(function(error){
        console.error(error)
        connection.send(JSON.stringify({
          'success_send':false
        }))  
      })


    } 
    if('register' in self){
      params = new URLSearchParams();
      params.append('username',self.login)
      params.append('password',self.password)
      axios.post('http://localhost:5000/api/register',params,)
      .then(function(response){
        if(response.status === 200){ 
          connection.send(JSON.stringify({
            'status':200,
            'token':response.data.token,
            'username':response.data.username,
            'register':'',
            'user_id':response.data.user_id
          }))
        }else{
          connection.send(JSON.stringify({
            'status':404,
            'register':''
          }))    
        }
      })
      .catch(function(error){
        connection.send(JSON.stringify({
          'status':400,
          'register':''
        }))
      })
      
    }
    if('logging' in self){
      params = new URLSearchParams();
      params.append('username',self.login)
      params.append('password',self.password)
      axios.post('http://localhost:5000/api/login',params,)
      .then(function(response){
          
          if(response.status === 200){
            
            
            connection.send(JSON.stringify({
              'status':200,
              'token':response.data.token,
              'username':response.data.username,
              'user_id':response.data.user_id,
              'logging':''
            }))
          }else{
            connection.send(JSON.stringify({
              'status':404,
              'logging':''
            }))    
          }
      })
      .catch(function(error){
        connection.send(JSON.stringify({
          'status':404,
          'logging':''
        }))
      })
    }
    if ('deny_call' in self){
      let is_online = false
        
      connections.forEach(conn => {
        if(self.user_id == conn.user_id){
          is_online = true
          conn.connection.send(JSON.stringify({
            denying:'',
            user_id:self.user_id,
            username:self.username,
            status:200
          }))
        }
      })

      if(!is_online)
        connection.send(JSON.stringify({
          denying:'',
          status:400
        }))
    }
    if ('accept_call' in self){
      let is_online = false
        
      connections.forEach(conn => {
        if(self.user_id == conn.user_id){
          is_online = true
          conn.connection.send(JSON.stringify({
            accepting:'',
            user_id:self.user_id,
            username:self.username,
            status:200
          }))
        }
      })

      if(!is_online)
        connection.send(JSON.stringify({
          accepting:'',
          status:400
        }))
    }
    

    if('start_call' in self){
        let is_online = false
        
        connections.forEach(conn => {
          if(self.user_id == conn.user_id){
            is_online = true
            conn.connection.send(JSON.stringify({
              calling:'',
              user_id:self.user_id,
              username:self.username,
              status:200,
              my_id:self.my_id
            }))
          }
        })

        if(!is_online)
          connection.send(JSON.stringify({
            calling:'',
            status:400
          }))
    }

    
  });

  connection.on('close', function(connection) {
    console.log('socket is closed')
  });
});