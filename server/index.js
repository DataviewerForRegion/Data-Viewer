const debug = require('debug');
require('dotenv').config();
const app = require('./app');
const models = require('./app/models');
const bcrypt = require('bcryptjs');

app.set('port', process.env.PORT || 3000);
models.sequelize.sync().then(() => {
	const password = process.env.ADMIN_PASSWORD;
	const salt = bcrypt.genSaltSync(10);
	const hashedPassword = bcrypt.hashSync(password, salt);
	models.User.findOrCreate({
		where: { username: process.env.ADMIN_USERNAME }, 
		defaults: {
				email: process.env.ADMIN_EMAIL,
				firstName: process.env.ADMIN_FIRSTNAME,
				lastName: process.env.ADMIN_LASTNAME,
				salt: salt,
				password: hashedPassword
		}
  });
	var server = app.listen(app.get('port'), function() {
		debug('Express server listening on port ' + server.address().port);	
	})
})
