        jQuery(function($){
            var socket = io.connect();
            var $nickContainerBox = $('#nickWrap')
            var $nickForm = $('#setNick');
            var $nickError= $('#nickError');
            var $nickBox = $('#nickname')
            var $users = $('#users')
            var $messageForm = $('#send-message');
            var $messageBox = $('#message');
            var $messageContainerBox = $('#contentWrap')
            var chat = $('#chat');

            $(".emoji").click(function(){
                var emoji = $(this).text();
                $("#message").val($("#message").val() + emoji)
            })
			$nickForm.submit(function (e){
                e.preventDefault();
				socket.emit('new user', $nickBox.val(), function(data){
                    if(data == false){
						$nickError.html('Não é possível entrar sem digitar um usuário.')
                    }else if(data){                        
                        $nickContainerBox.css('display','none')
                        $messageContainerBox.css('display','flex')
					}else{
						$nickError.html('Esse usuário já está em uso, tente novamente usando outro username.')
					}
				})				
			})

            $messageForm.submit(function (e){
                e.preventDefault();
                socket.emit('send-message', {'messageBox': $messageBox.val(), 'user': $users.val()})
                $messageBox.val('');
            })

            socket.on('usernames', function(data){
                var html = [];
                var i = 0;
                html +=("<option value=''>Todos</option>")
                html += "<option disabled class='dropdown-item' value=" + $nickBox.val() + ">" + $nickBox.val() + " (você)</option>"
                for(i=0;i<data.length;i++){
//                    html += data[i] + '<br/>'
                     if(data[i] != $nickBox.val()){
                        html += "<option class='dropdown-item' value=" + data[i] + ">" + data[i] + "</option>"
                     }
    }
                $users.html(html)

            })

            socket.on('whisper', function(data){
                chat.append('<span class="whispe"><b>' + data.nick + "</b>" + ": " + data.msg + "</span><br/>")
                Push.create('innerChat', {
                    body: data.nick + ": " + data.msg,
                    icon: './assets/imgs/chat.png',
                    timeout: 8000,               // Timeout before notification closes automatically.
                    vibrate: [100, 100, 100],    // An array of vibration pulses for mobile devices.
                    onClick: function() {
                        window.focus()
                    }  
                });                
            })
            socket.on('new message', function(data){
                chat.append("<b>" + data.nick + "</b>" + ": " + data.msg + "<br/>")                
                Push.create('innerChat SRA/ME-PE', {
                    body: data.nick + ": " + data.msg,
                    icon: './assets/imgs/chat.png',
                    timeout: 8000,               // Timeout before notification closes automatically.
                    vibrate: [100, 100, 100],    // An array of vibration pulses for mobile devices.
                    onClick: function() {
                        window.focus()
                    }  
                });                

            })

        })