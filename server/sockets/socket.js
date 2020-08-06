const { io } = require('../server');
const {Usuarios}=require('../classes/usuarios');
const usuarios= new Usuarios;
const {crearMensaje}=require('../util/utils')

io.on('connection', (client) => {

    client.on('entrarChat',(data,callback)=>{
        if(!data.nombre || !data.sala){
            return callback({
                erro:true,
                mensaje:'el nombre/sala es necesaro'
            });
        }
        client.join(data.sala);
        usuarios.agregarPersona(client.id,data.nombre,data.sala);
        client.broadcast.to(data.sala).emit('listaPersona',usuarios.getPersonasPorSala(data.sala));
        callback(usuarios.getPersonasPorSala(data.sala));
    });

    client.on('crearMensaje',(data)=>{
        let persona=usuarios.getPersona(client.id);
        let mensaje=crearMensaje(persona.nombre,data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje',mensaje);
    });

    client.on('disconnect',()=>{
       let personaBorrada= usuarios.borrarPersona(client.id);
       client.broadcast.to(personaBorrada.sala).emit('crearMensaje',crearMensaje('Administrador',`${personaBorrada.nombre } salió`));
       client.broadcast.to(personaBorrada.sala).emit('listaPersona',usuarios.getPersonasPorSala(personaBorrada.sala));

    });
    //msjs priv
    client.on('mensajePrivado',(data)=>{
        let persona=usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado',crearMensaje(persona.nombre,data.mensaje));
    });
});