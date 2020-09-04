const { Model , DataTypes } = require("sequelize");

class Users extends Model {
    // constructor da classe user
    static init( sequelize ){
		super.init({
			name     : DataTypes.STRING,
			mail     : DataTypes.STRING,
			cpf      : DataTypes.STRING,
            password : DataTypes.STRING,
		},{
			sequelize,
		})
    }

    /* RELACIONAMENTOS SÂO DECLARADOS AQUI */
	// static associete( MODELS ){
    
    // }
}
module.exports = Users; 