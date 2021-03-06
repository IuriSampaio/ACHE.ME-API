const {Op} = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Users = require('../models/Users');
const City = require('../models/City');
const States = require('../models/States');
const WhereLive = require('../models/WhereLive');

module.exports = {
/* SELECT */
    index  : async( req, res ) => {
        const users = await Users.findAll();
        
        let AllUsers = [];
        
        users.forEach(async (user) =>{
           
            const whereLive = await WhereLive.findByPk(user.dataValues.where_live_id);
            const state = await States.findByPk(whereLive.dataValues.state_id,{raw:true});
            const city = await City.findByPk(whereLive.dataValues.city_id,{raw:true});

            const thisUser = 
                {   
                    
                    ...user.dataValues, 
                    where_live: {
                        ...whereLive.dataValues,
                        state   : state.name_of_state,
                        city    : city.name_of_city,
                    }
                    
                    
                };

            AllUsers[AllUsers.length] = thisUser;

            if(AllUsers.length == users.length)
                return res.status(201).send(AllUsers);    
        });
        
        //return res.status(201).send(users);
    },

    findByName : async( req , res ) => {
        const { name } = req.query;
    try{

        var userExist = name.length > 2 && await Users.findAll( { 
            where: { 
                [Op.or]:[
                    {name:{[Op.substring]: name}},
                    {mail:{[Op.substring]: name}}
                ] 
            }
        });

    }catch(e){
       console.log(e)
    }
        return userExist ? res.status(200).send(userExist) : res.status(401);
    },


    searchForId : async ( req, res ) => {

        const {userId} = req.params;

        let user = await Users.findByPk(userId);

        if (!user) {
            return res.status(404).send({erro:"usuario não encontrado!"});
        }

        const whereLive = await WhereLive.findByPk(user.dataValues.where_live_id);
        const state = await States.findByPk(whereLive.dataValues.state_id,{raw:true});
        const city = await City.findByPk(whereLive.dataValues.city_id,{raw:true});

        const thisUser = 
            {   
                
                ...user.dataValues, 
                where_live: {
                    ...whereLive.dataValues,
                    state   : state.name_of_state,
                    city    : city.name_of_city,
                }
                
                
            };

        res.send(thisUser);

    },

    login : async( req , res ) => {
        
        const {mail, password} = req.body;

        if (mail){
            const emailExists = mail ? await Users.findOne({ where: { [Op.or] : [  {mail:mail}, {telephone:mail} ] } }) : null;
            if ( emailExists  && await bcrypt.compareSync(password, emailExists.dataValues.password) ){
                let token = jwt.sign( {userId: emailExists.dataValues.id} , "TCC_SENAI" );
                return res.status(201).send({ "status":true , "user":{...emailExists.dataValues} , "token":token });
            }
        }

        
        return res.status(401).send({erro:"Usuario e/ou senha incorretos"});
    },
/* INSERT */
    store  : async( req , res ) => {

        const { name, mail , CPF , telephone , password , cep , bairro , street , number , complement , city , state,photo } = req.query;
        
        let CityR = await City.findOne({ where: { name_of_city:city } });
        if (! CityR)
            CityR =await City.create({name_of_city:city});
        
        const city_id = CityR.dataValues.id;
        
        let StateR = await States.findOne({ where: { name_of_state:state } });
        if (! StateR )
            StateR =await States.create({name_of_state:state});
        
        const state_id = StateR.dataValues.id;
        
        const whereLive = await WhereLive.create({cep, bairro, street, number, complement, state_id, city_id});
        
        const where_live_id = whereLive.dataValues.id;
        
        const cryptPassword = await bcrypt.hash(password,10);

        const user = await Users.create( { name , mail , cpf:CPF , telephone , password:cryptPassword , photo , where_live_id} );

        //const token = jwt.sign( {userId: user.id} , "TCC_SENAI" );

        return res.status(201).send(`
        <div class="loadingio-spinner-ripple-f1r5fgdrfo9"><div class="ldio-7jncfqzaovv">
        <div></div><div></div>
        </div></div>
        <style type="text/css">
        
        @keyframes ldio-7jncfqzaovv {
          0% {
            top: 96px;
            left: 96px;
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            top: 18px;
            left: 18px;
            width: 156px;
            height: 156px;
            opacity: 0;
          }
        }
        
        .ldio-7jncfqzaovv div {
          position: absolute;
          border-width: 4px;
          margin-left:calc(50vh-156px)
          border-style: solid;
          opacity: 1;
          border-radius: 50%;
          animation: ldio-7jncfqzaovv 1s cubic-bezier(0,0.2,0.8,1) infinite;
        }
        
        .ldio-7jncfqzaovv div:nth-child(1) {
          border-color: #e90c59
        }
        
        .ldio-7jncfqzaovv div:nth-child(2) {
          border-color: #46dff0;
          animation-delay: -0.5s;
        }
        
        .loadingio-spinner-ripple-f1r5fgdrfo9 {
          width: 200px;
          height: 200px;
          display: inline-block;
          overflow: hidden;
          background: #ffffff;
        }
        .ldio-7jncfqzaovv {
          width: 100%;
          height: 100%;
          position: relative;
          transform: translateZ(0) scale(1);
          backface-visibility: hidden;
          transform-origin: 0 0;
        }
        .ldio-7jncfqzaovv div { box-sizing: content-box; }
        /* generated by https://loading.io/ */
        </style>
        
        <script type='text/javascript'>location.href='https://ache-me.netlify.app/'</script>`);
    },
/* UPDATE */
    update : async( req , res ) => {
        const { userId } = req.params;

        var { name, mail, CPF, telephone, password, newPassword, confirmPassword, merit, indication, cep, bairro, street, number, complement, city, state} = req.body;

        const user = await Users.findByPk(userId);

        const ExistUser = await Users.findOne({ where: { [Op.or] : [{name:name} , {cpf:CPF} , {mail:mail} ] } });

        if (!password) {
            return res.status(401).send({erro:"Digite sua senha atual."});
        }

        if(await !bcrypt.compareSync(password, ExistUser.password ) ){
            return res.status(401).send({erro:"senha incorreta"});
            // return res.status(401).send({"error":"Está conta já existe"});
        }

        if (newPassword) {
            if (confirmPassword) {
                if (newPassword == confirmPassword) {
                    password = newPassword;
                }else{
                    return res.status(401).send({erro:"Nova senha e confirmar senha estão diferentes."});
                }    
            }else {
                return res.status(401).send({erro:"Confirme sua senha."});
            }
        }
        
        const whereMaybeLived = await WhereLive.findByPk(user.dataValues.where_live_id);
        const cityToCompare = await City.findByPk(whereMaybeLived.dataValues.city_id);
        const stateToCompare = await States.findByPk(whereMaybeLived.dataValues.state_id);
        
        const whereMaybeLivedId = whereMaybeLived.dataValues.id

        if ( cityToCompare.dataValues.name_of_city !== city && city ) {
            const cityExists = await City.findOne({where: {name_of_city : city}});
            if ( cityExists ){
                await WhereLive.update({ city_id : cityExists.dataValues.id , updatedAt:null} , { where:{id: whereMaybeLivedId}});
            } else {
                const newCityUpdated = await City.create({name_of_city : city}); 
                await WhereLive.update({ city_id : newCityUpdated.dataValues.id , updatedAt:null} , { where:{id: whereMaybeLivedId}});
            } 
        }

        if ( stateToCompare.dataValues.name_of_state !== state && state ) {
            const stateExists = await States.findOne({where: {name_of_state : state}});
            if ( stateExists ){
                await WhereLive.update({ state_id : stateExists.dataValues.id , updatedAt:null} , { where:{id: whereMaybeLivedId}});
            } else {
                const newStateUpdated = await States.create({name_of_state : state}); 
                await WhereLive.update({ city_id : newStateUpdated.dataValues.id , updatedAt:null} , { where:{id: whereMaybeLivedId}});
            } 
        }
        
        if ( ( whereMaybeLived.dataValues.cep !== cep && cep ) || ( whereMaybeLived.dataValues.number !== number && number ) || ( whereMaybeLived.dataValues.complement !== complement && complement ) || ( whereMaybeLived.dataValues.bairro !== bairro && bairro ) || ( whereMaybeLived.dataValues.street !== street && street ) ) {
            await WhereLive.update({cep, bairro, number, street, complement, updatedAt:null},{where:{id: whereMaybeLivedId}});
        }

        const cryptPassword = await bcrypt.hash(password,10);

        const userUpdated = await Users.update({name , mail , cpf:CPF , telephone , password:cryptPassword, merit , indication , updatedAt:null }, { where: { id: userId } });
        
        if( !userUpdated )
            return res.status(401).send({erro:"Algo errado com sua conta"});
        
        return res.status(201).send({sucess:"Usuário foi atualizado com sucesso!"});
    },

    photoUpdate : async( req, res) => {
        const { userId } = req.params;

        const { firebaseUrl } = req.file ? req.file : "";

        const photoUpdated = await Users.update({photo:firebaseUrl , updatedAt:null }, { where: { id: userId } });
        
        if( photoUpdated ){
            return res.status(201).send({sucess:"Foto editada com sucesso!"});
        }

        return res.status(401).send({erro:"Não foi possivel editar a foto"});        
    },

    updateFieldOfUsers: async( req , res ) => {
        const {userId} = req.params;

        const { field, contentOfField } = req.body;

        const thisUser = await Users.findByPk(userId);
        
        if( thisUser && thisUser.dataValues[field] != contentOfField ){
            
            const string = `{
                "${field}" : "${contentOfField}"
            }`;
            
            const userWithFieldUpdated = await Users.update( JSON.parse(string) , { where: { id : userId } } );
            
            if( userWithFieldUpdated )
                return res.status(201).send(userWithFieldUpdated);
            
        }
        
        return res.status(422).send({"error": "Este usuário não existe ou não houve alteração"});
        
    },
    updateFieldFromWhereUserLive: async( req, res) => {
        const {userId} = req.params;

        const { field, contentOfField } = req.body;

        const thisUser = await Users.findByPk(userId);
        
        const whereUserLive = await WhereLive.findByPk(thisUser.dataValues.where_live_id);

        if( whereUserLive && whereUserLive.dataValues[field] != contentOfField ){
            
            const string = `{
                "${field}" : "${contentOfField}"
            }`;
            
            const userWithFieldFromWhereLiveUpdated = await WhereLive.update( JSON.parse(string) , { where: { id : whereUserLive.id } } );
            
            if( userWithFieldFromWhereLiveUpdated )
                return res.status(201).send(userWithFieldFromWhereLiveUpdated);
            
        }
        
        return res.status(422).send({"error": "Este usuário não existe ou não houve alteração"});
    
    },
/* DELETE */
    delete : async( req , res ) => {
        const { userId } = req.params;
        const thisUser = await Users.findByPk(userId);
        
        const userDeleted = await Users.destroy({where:{[Op.and]:{id:userId,where_live_id:thisUser.dataValues.where_live_id}}})
        
        if(!userDeleted){
            return res.status(401).send({"error":"Algo está errado!"})
        }
        return res.sendStatus(203);
    },
};
