const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/sendEmail');
const generateVerificationToken = require('../utils/verifyToken');
const saveVerificationToken = require('../utils/saveVerificationToken');
const { findUserByVerificationToken } = require('../utils/findUserByVerificationToken');
const ProductLike = require('../models/ProductLike');
const rateLimit = require('express-rate-limit');

// Configurar el limitador de tasa
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutos
    max: 5, // Limite a 5 solicitudes por IP cada 15 minutos
    message: "Demasiados intentos de inicio de sesión desde esta IP, por favor intente de nuevo después de 15 minutos"
});


const getAll = catchError(async (req, res) => {
	const results = await User.findAll();
	return res.json(results);
});

// ------------Buscar datos de usuario ----------------
const getOne = catchError(async (req, res) => {
	const { id } = req.params;
	const results = await User.findOne({ where: { id } });
	return res.json(results);
});


const createUser = catchError(async (req, res) => {
	
	const { dni, phone_first, phone_second, city, address, firstName, lastName, email, password } = req.body || req;

	const hashPassword = await bcrypt.hash(password, 10);
	//Verificar si es que el usuario ya existe en la base de datos 
	
	if (!email) {
		return res.status(400).json({ message: 'No existe el campo email.' });
	}
	
	const userExist = await User.findOne({ where: { email, isVerify: false } });
	if (userExist) {
		return res.status(400).json({ message: 'Este email ya esta registrado, pero aun no verificado.' });
	}

	// Si isVerify es true retornar este usuario ya esta registrado
	const userExistAndVerify = await User.findOne({ where: { email, isVerify: true } });
	if (userExistAndVerify) {
		return res.status(400).json({ message: 'Este email ya esta registrado y verificado, inicia sesión' });
	}

	// Crear el usuario en la base de datos
	const newUser = await User.create({ dni, phone_first, phone_second, city, address, firstName, lastName, email, password: hashPassword, rol: 'client' });

	// Generar un token de verificación único (utilice una librería como 'uuid' para esto)
	const verificationToken = generateVerificationToken(); // Esta función debe ser implementada para generar un token único

	// Guardar el token de verificación en la base de datos, asociado al usuario
	await saveVerificationToken(newUser.id, verificationToken); // Esta función debe ser implementada

	// Construir el enlace de verificación	
	const verificationLink = `${process.env.FRONTEND_URL}/verify/${verificationToken}`; // Esta URL debe ser la URL de tu aplicación frontend    

	// Configurar el correo electrónico
	const mailOptions = {
		to: email,
		subject: 'Verificación de Correo Electrónico Everchic',
		html: `
        <!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
	<title></title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;200;300;400;500;600;700;800;900"
		rel="stylesheet" type="text/css">
	<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
		}

		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: inherit !important;
		}

		#MessageViewBody a {
			color: inherit;
			text-decoration: none;
		}

		p {
			line-height: inherit;
		}

		.desktop_hide,
		.desktop_hide table {
			mso-hide: all;
			display: none;
			max-height: 0px;
			overflow: hidden;
		}

		.image_block img+div {
			display: none;
		}

		@media (max-width: 520px) {

			.desktop_hide table.icons-inner,
			.social_block.desktop_hide .social-table {
				display: inline-block !important;
			}

			.icons-inner {
				text-align: center;
			}

			.icons-inner td {
				margin: 0 auto;
			}

			.mobile_hide {
				display: none;
			}

			.row-content {
				width: 100% !important;
			}

			.stack .column {
				width: 100%;
				display: block;
			}

			.mobile_hide {
				min-height: 0;
				max-height: 0;
				max-width: 0;
				overflow: hidden;
				font-size: 0px;
			}

			.desktop_hide,
			.desktop_hide table {
				display: table !important;
				max-height: none !important;
			}

			.row-2 .column-1 .block-5.paragraph_block td.pad>div {
				font-size: 14px !important;
			}

			.row-2 .column-1 .block-7.paragraph_block td.pad>div {
				font-size: 12px !important;
			}
		}
	</style>
</head>

<body class="body"
	style="margin: 0; background-color: #ffffff; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
	<table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
		style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
		<tbody>
			<tr>
				<td>
					<table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
						role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0"
										cellspacing="0" role="presentation"
										style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px; margin: 0 auto;"
										width="500">
										<tbody>
											<tr>
												<td class="column column-1" width="100%"
													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="heading_block block-1" width="100%" border="0"
														cellpadding="10" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<h1
																	style="margin: 0; color: #000000; direction: ltr; font-family: 'Roboto', Tahoma, Verdana, Segoe, sans-serif; font-size: 26px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 31.2px;">
																	<span class="tinyMce-placeholder">Bienvenido/a a
																		Everchic</span>
																</h1>
															</td>
														</tr>
													</table>
													<table class="image_block block-2" width="100%" border="0"
														cellpadding="0" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;">
																<div class="alignment" align="center"
																	style="line-height:10px">
																	<div style="max-width: 500px;"><img
																			src="https://e128f99ede.imgdist.com/pub/bfra/kh54o4qd/zze/k9r/tvb/socks_comic.jpg"
																			style="display: block; height: auto; border: 0; width: 100%;"
																			width="500" height="auto"></div>
																</div>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
						role="presentation"
						style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0"
										cellspacing="0" role="presentation"
										style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 500px; margin: 0 auto;"
										width="500">
										<tbody>
											<tr>
												<td class="column column-1" width="100%"
													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="divider_block block-1" width="100%" border="0"
														cellpadding="10" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0"
																		role="presentation" width="100%"
																		style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner"
																				style="font-size: 1px; line-height: 1px; border-top: 1px solid #dddddd;">
																				<span>&#8202;</span>
																			</td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-2" width="100%" border="0"
														cellpadding="10" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div
																	style="color:#000000;direction:ltr;font-family:'Roboto', Tahoma, Verdana, Segoe, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
																	<p style="margin: 0;">Estamos emocionados de tenerte
																		como parte de nuestra comunidad.&nbsp; Por
																		favor, haz clic en el siguiente botón para
																		verificar tu correo electrónico y activar tu
																		cuenta:</p>
																</div>
															</td>
														</tr>
													</table>


													<table border="0" cellpadding="10" cellspacing="0"
														class="button_block block-3" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
														width="100%">
														<tr>
															<td class="pad">
																<div align="center" class="alignment"><!--[if mso]>
                                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="height:42px;width:142px;v-text-anchor:middle;" arcsize="10%" stroke="false" fillcolor="#7747ff">
                                                        <w:anchorlock/>
                                                        <v:textbox inset="0px,0px,0px,0px">
                                                        <center dir="false" style="color:#ffffff;font-family:Tahoma, Verdana, sans-serif;font-size:16px">
                                                        <![endif]-->
																	<div
																		style="background-color:#7747ff;border-bottom:0px solid transparent;border-left:0px solid transparent;border-radius:4px;border-right:0px solid transparent;border-top:0px solid transparent;color:#ffffff;display:inline-block;font-family:'Roboto', Tahoma, Verdana, Segoe, sans-serif;font-size:16px;font-weight:400;mso-border-alt:none;padding-bottom:5px;padding-top:5px;text-align:center;text-decoration:none;width:auto;word-break:keep-all;">
																		<span
																			style="padding-left:20px;padding-right:20px;font-size:16px;display:inline-block;letter-spacing:normal;">
                                                                            
                                                                            <a href="${verificationLink}" style="display: inline-block; background-color: #7747ff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-align: center;">Activar cuenta</a>

                                                                        </span>
                                                                    </div>
																	<!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
																</div>
															</td>
														</tr>
													</table>


													<table class="divider_block block-4" width="100%" border="0"
														cellpadding="10" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0"
																		role="presentation" width="100%"
																		style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner"
																				style="font-size: 1px; line-height: 1px; border-top: 1px solid #dddddd;">
																				<span>&#8202;</span>
																			</td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-5" width="100%" border="0"
														cellpadding="10" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div
																	style="color:#000000;direction:ltr;font-family:'Roboto', Tahoma, Verdana, Segoe, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:16.8px;">
																	<p style="margin: 0;">Si no has solicitado esta
																		verificación, puedes ignorar este mensaje.</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="divider_block block-6" width="100%" border="0"
														cellpadding="10" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0"
																		role="presentation" width="100%"
																		style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner"
																				style="font-size: 1px; line-height: 1px; border-top: 1px solid #dddddd;">
																				<span>&#8202;</span>
																			</td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-7" width="100%" border="0"
														cellpadding="10" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div
																	style="color:#000000;direction:ltr;font-family:'Roboto', Tahoma, Verdana, Segoe, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:center;mso-line-height-alt:16.8px;">
																	<p style="margin: 0;">Everchic - Todos los derechos
																		reservados</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="social_block block-8" width="100%" border="0"
														cellpadding="10" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table class="social-table" width="72px" border="0"
																		cellpadding="0" cellspacing="0"
																		role="presentation"
																		style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;">
																		<tr>
																			<td style="padding:0 2px 0 2px;"><a
																					href="https://www.facebook.com/everchicsa"
																					target="_blank"><img
																						src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/facebook@2x.png"
																						width="32" height="auto"
																						alt="Facebook" title="facebook"
																						style="display: block; height: auto; border: 0;"></a>
																			</td>
																			<td style="padding:0 2px 0 2px;"><a
																					href="https://www.instagram.com/ever_chic_"
																					target="_blank"><img
																						src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/instagram@2x.png"
																						width="32" height="auto"
																						alt="Instagram"
																						title="instagram"
																						style="display: block; height: auto; border: 0;"></a>
																			</td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
		</tbody>
	</table><!-- End -->
</body>

</html>
        `
	};

	// Enviar el correo electrónico de verificación
	sendEmail(mailOptions);

	return res.status(201).json(newUser);
});



// Controlador para manejar la solicitud de verificación de correo electrónico
const verifyEmail = catchError(async (req, res) => {
	const { id } = req.params;
	console.log(id);
	const user = await findUserByVerificationToken(id);
	if (user) {
		await markUserAsVerified(user.id);
		res.sendStatus(200);
	} else {
		res.status(400).send('No se encontró un usuario con este token de verificación.');
	}
});

// Validar sesión del usuario si aún es válida con JWT
const validateSession = catchError(async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if (!decoded || !decoded.user) {
            return res.status(401).json({ message: 'Invalid authentication token' });
        }

        // Si llegamos aquí, el token es válido
        return res.status(200).json({ message: 'Session validated', user: decoded.user });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid authentication token' });
    }
});


const markUserAsVerified = async (userId) => {
	try {
		// Actualiza el campo isVerify a true y elimina el token de verificación de la base de datos
		await User.update({ isVerify: true, verificationToken: null }, { where: { id: userId } });
	} catch (error) {
		console.error('Error al marcar al usuario como verificado:', error);
		throw new Error('Error al marcar al usuario como verificado');
	}
};


const remove = catchError(async (req, res) => {
	const { id } = req.params;
	const result = await User.destroy({ where: { id } });
	if (!result) return res.sendStatus(404);
	return res.sendStatus(204);
});



const update = catchError(async (req, res) => {
	const { id } = req.params;
	//evita la actualizacion del email y el password
	delete req.body.email
	delete req.body.password

	const result = await User.update(
		req.body,
		{ where: { id }, returning: true }
	);
	if (result[0] === 0) return res.sendStatus(404);
	return res.json(result[1][0]);


});

const login = catchError(async (req, res) => {
    const { email, password } = req.body;

    // Validar entradas
    if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son requeridos." });
    }

    // Comprobamos si existe el usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas." });
    }

    // Comprobamos si el usuario está verificado
    if (!user.isVerify) {
        return res.status(401).json({ message: "Tu correo electrónico no ha sido verificado. Por favor, verifica tu correo." });
    }

    // Comprobamos si la contraseña es válida
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ message: "Credenciales inválidas." });
    }

    // Generar el token JWT
    const token = jwt.sign(
        { userId: user.id }, // Solo incluir la información mínima necesaria
        process.env.TOKEN_SECRET,
        { expiresIn: '1d' }
    );

    return res.json({ user, token });
});


//Endpoint Resend msj verification
const resendVerification = catchError(async (req, res) => {
	const { email } = req.body;	
	const user = await User.findOne({ where: { email } });
	if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
	const verificationToken = generateVerificationToken();
	await User.update({ verificationToken }, { where: { email } });
	const verificationLink = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

	// Configuramos las opciones del correo
	const mailOptions = {
		to: email,
		subject: 'Activación de cuenta - Everchic',
		html: `
        <!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
	<title></title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;200;300;400;500;600;700;800;900"
		rel="stylesheet" type="text/css">
	<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
		}

		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: inherit !important;
		}

		#MessageViewBody a {
			color: inherit;
			text-decoration: none;
		}

		p {
			line-height: inherit;
		}

		.desktop_hide,
		.desktop_hide table {
			mso-hide: all;
			display: none;
			max-height: 0px;
			overflow: hidden;
		}

		.image_block img+div {
			display: none;
		}

		@media (max-width: 520px) {

			.desktop_hide table.icons-inner,
			.social_block.desktop_hide .social-table {
				display: inline-block !important;
			}

			.icons-inner {
				text-align: center;
			}

			.icons-inner td {
				margin: 0 auto;
			}

			.mobile_hide {
				display: none;
			}

			.row-content {
				width: 100% !important;
			}

			.stack .column {
				width: 100%;
				display: block;
			}

			.mobile_hide {
				min-height: 0;
				max-height: 0;
				max-width: 0;
				overflow: hidden;
				font-size: 0px;
			}

			.desktop_hide,
			.desktop_hide table {
				display: table !important;
				max-height: none !important;
			}

			.row-2 .column-1 .block-5.paragraph_block td.pad>div {
				font-size: 14px !important;
			}

			.row-2 .column-1 .block-7.paragraph_block td.pad>div {
				font-size: 12px !important;
			}
		}
	</style>
</head>

<body class="body"
	style="margin: 0; background-color: #ffffff; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
	<table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
		style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
		<tbody>
			<tr>
				<td>
					<table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
						role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0"
										cellspacing="0" role="presentation"
										style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px; margin: 0 auto;"
										width="500">
										<tbody>
											<tr>
												<td class="column column-1" width="100%"
													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="heading_block block-1" width="100%" border="0"
														cellpadding="10" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<h1
																	style="margin: 0; color: #000000; direction: ltr; font-family: 'Roboto', Tahoma, Verdana, Segoe, sans-serif; font-size: 26px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 31.2px;">
																	<span class="tinyMce-placeholder">Bienvenido/a a
																		Everchic</span>
																</h1>
															</td>
														</tr>
													</table>
													<table class="image_block block-2" width="100%" border="0"
														cellpadding="0" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;">
																<div class="alignment" align="center"
																	style="line-height:10px">
																	<div style="max-width: 500px;"><img
																			src="https://e128f99ede.imgdist.com/pub/bfra/kh54o4qd/zze/k9r/tvb/socks_comic.jpg"
																			style="display: block; height: auto; border: 0; width: 100%;"
																			width="500" height="auto"></div>
																</div>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
						role="presentation"
						style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0"
										cellspacing="0" role="presentation"
										style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 500px; margin: 0 auto;"
										width="500">
										<tbody>
											<tr>
												<td class="column column-1" width="100%"
													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="divider_block block-1" width="100%" border="0"
														cellpadding="10" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0"
																		role="presentation" width="100%"
																		style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner"
																				style="font-size: 1px; line-height: 1px; border-top: 1px solid #dddddd;">
																				<span>&#8202;</span>
																			</td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-2" width="100%" border="0"
														cellpadding="10" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div
																	style="color:#000000;direction:ltr;font-family:'Roboto', Tahoma, Verdana, Segoe, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
																	<p style="margin: 0;">Estamos emocionados de tenerte
																		como parte de nuestra comunidad.&nbsp; Por
																		favor, haz clic en el siguiente botón para
																		verificar tu correo electrónico y activar tu
																		cuenta:</p>
																</div>
															</td>
														</tr>
													</table>


													<table border="0" cellpadding="10" cellspacing="0"
														class="button_block block-3" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
														width="100%">
														<tr>
															<td class="pad">
																<div align="center" class="alignment"><!--[if mso]>
                                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="height:42px;width:142px;v-text-anchor:middle;" arcsize="10%" stroke="false" fillcolor="#7747ff">
                                                        <w:anchorlock/>
                                                        <v:textbox inset="0px,0px,0px,0px">
                                                        <center dir="false" style="color:#ffffff;font-family:Tahoma, Verdana, sans-serif;font-size:16px">
                                                        <![endif]-->
																	<div
																		style="background-color:#7747ff;border-bottom:0px solid transparent;border-left:0px solid transparent;border-radius:4px;border-right:0px solid transparent;border-top:0px solid transparent;color:#ffffff;display:inline-block;font-family:'Roboto', Tahoma, Verdana, Segoe, sans-serif;font-size:16px;font-weight:400;mso-border-alt:none;padding-bottom:5px;padding-top:5px;text-align:center;text-decoration:none;width:auto;word-break:keep-all;">
																		<span
																			style="padding-left:20px;padding-right:20px;font-size:16px;display:inline-block;letter-spacing:normal;">
                                                                            
                                                                            <a href="${verificationLink}" style="display: inline-block; background-color: #7747ff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-align: center;">Activar cuenta</a>

                                                                        </span>
                                                                    </div>
														<!--[if mso]></center></v:textbox></v:roundrect>
                                                        <![endif]-->
																</div>
															</td>
														</tr>
													</table>


													<table class="divider_block block-4" width="100%" border="0"
														cellpadding="10" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0"
																		role="presentation" width="100%"
																		style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner"
																				style="font-size: 1px; line-height: 1px; border-top: 1px solid #dddddd;">
																				<span>&#8202;</span>
																			</td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-5" width="100%" border="0"
														cellpadding="10" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div
																	style="color:#000000;direction:ltr;font-family:'Roboto', Tahoma, Verdana, Segoe, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:16.8px;">
																	<p style="margin: 0;">Si no has solicitado esta
																		verificación, puedes ignorar este mensaje.</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="divider_block block-6" width="100%" border="0"
														cellpadding="10" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0"
																		role="presentation" width="100%"
																		style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner"
																				style="font-size: 1px; line-height: 1px; border-top: 1px solid #dddddd;">
																				<span>&#8202;</span>
																			</td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-7" width="100%" border="0"
														cellpadding="10" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div
																	style="color:#000000;direction:ltr;font-family:'Roboto', Tahoma, Verdana, Segoe, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:center;mso-line-height-alt:16.8px;">
																	<p style="margin: 0;">Everchic - Todos los derechos
																		reservados</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="social_block block-8" width="100%" border="0"
														cellpadding="10" cellspacing="0" role="presentation"
														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table class="social-table" width="72px" border="0"
																		cellpadding="0" cellspacing="0"
																		role="presentation"
																		style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;">
																		<tr>
																			<td style="padding:0 2px 0 2px;"><a
																					href="https://www.facebook.com/everchicsa"
																					target="_blank"><img
																						src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/facebook@2x.png"
																						width="32" height="auto"
																						alt="Facebook" title="facebook"
																						style="display: block; height: auto; border: 0;"></a>
																			</td>
																			<td style="padding:0 2px 0 2px;"><a
																					href="https://www.instagram.com/ever_chic_"
																					target="_blank"><img
																						src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/instagram@2x.png"
																						width="32" height="auto"
																						alt="Instagram"
																						title="instagram"
																						style="display: block; height: auto; border: 0;"></a>
																			</td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
		</tbody>
	</table><!-- End -->
</body>

</html>
        `
	}

	try {
		await sendEmail(mailOptions, verificationLink);
		return res.json({ message: "Se ha enviado un correo de verificación" });
	} catch (error) {
		console.error('Error al enviar el correo electrónico:', error);
		return res.status(500).json({ message: "Error al enviar el correo de verificación" });
	}

});

// Endpoint Recover password
const recoverPassword = catchError(async (req, res) => {
	const { email } = req.body;

	// Comprobamos si el usuario existe
	const user = await User.findOne({ where: { email } });
	if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

	// Generamos un token que caduca en 1 día
	const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, { expiresIn: "1d" });

	// Creamos el enlace de verificación
	const verificationLink = `${process.env.FRONTEND_URL}/recover_account/${token}`;

	// Configuramos las opciones del correo
	const mailOptions = {
		to: email,
		subject: 'Restablecimiento de contraseña - Everchic',
		html: `
        <!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
	<title></title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!-->
	<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;200;300;400;500;600;700;800;900" rel="stylesheet" type="text/css"><!--<![endif]-->
	<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
		}

		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: inherit !important;
		}

		#MessageViewBody a {
			color: inherit;
			text-decoration: none;
		}

		p {
			line-height: inherit
		}

		.desktop_hide,
		.desktop_hide table {
			mso-hide: all;
			display: none;
			max-height: 0px;
			overflow: hidden;
		}

		.image_block img+div {
			display: none;
		}

		@media (max-width:520px) {

			.desktop_hide table.icons-inner,
			.social_block.desktop_hide .social-table {
				display: inline-block !important;
			}

			.icons-inner {
				text-align: center;
			}

			.icons-inner td {
				margin: 0 auto;
			}

			.mobile_hide {
				display: none;
			}

			.row-content {
				width: 100% !important;
			}

			.stack .column {
				width: 100%;
				display: block;
			}

			.mobile_hide {
				min-height: 0;
				max-height: 0;
				max-width: 0;
				overflow: hidden;
				font-size: 0px;
			}

			.desktop_hide,
			.desktop_hide table {
				display: table !important;
				max-height: none !important;
			}

			.row-2 .column-1 .block-7.paragraph_block td.pad>div {
				font-size: 12px !important;
			}

			.row-2 .column-1 .block-5.paragraph_block td.pad>div {
				font-size: 14px !important;
			}
		}
	</style>
</head>

<body class="body" style="margin: 0; background-color: #ffffff; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
	<table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
		<tbody>
			<tr>
				<td>
					<table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px; margin: 0 auto;" width="500">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="heading_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<h1 style="margin: 0; color: #000000; direction: ltr; font-family: 'Roboto', Tahoma, Verdana, Segoe, sans-serif; font-size: 26px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 31.2px;"><span class="tinyMce-placeholder">Everchic</span></h1>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 500px; margin: 0 auto;" width="500">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="divider_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #dddddd;"><span>&#8202;</span></td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#000000;direction:ltr;font-family:'Roboto', Tahoma, Verdana, Segoe, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
																	<p style="margin: 0;">Hola ${user.firstName}, recibimos una solicitud para recuperar tu cuenta.</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="button_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center"><!--[if mso]>
                                                                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="height:42px;width:207px;v-text-anchor:middle;" arcsize="10%" stroke="false" fillcolor="#7747ff">
                                                                    <w:anchorlock/>
                                                                    <v:textbox inset="0px,0px,0px,0px">
                                                                    <center dir="false" style="color:#ffffff;font-family:Tahoma, Verdana, sans-serif;font-size:16px">
                                                                    <![endif]-->
																	<div
																		style="background-color:#7747ff;border-bottom:0px solid transparent;border-left:0px solid transparent;border-radius:4px;border-right:0px solid transparent;border-top:0px solid transparent;color:#ffffff;display:inline-block;font-family:'Roboto', Tahoma, Verdana, Segoe, sans-serif;font-size:16px;font-weight:400;mso-border-alt:none;padding-bottom:5px;padding-top:5px;text-align:center;text-decoration:none;width:auto;word-break:keep-all;">
																		<span
																			style="padding-left:20px;padding-right:20px;font-size:16px;display:inline-block;letter-spacing:normal;">
                                                                            
                                                                            <a href="${verificationLink}" style="display: inline-block; background-color: #7747ff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-align: center;">Restablecer contraseña</a>

                                                                        </span>
                                                                    </div>
                                                                    <!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
																</div>
															</td>
														</tr>
													</table>
													<table class="divider_block block-4" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #dddddd;"><span>&#8202;</span></td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-5" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#000000;direction:ltr;font-family:'Roboto', Tahoma, Verdana, Segoe, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:16.8px;">
																	<p style="margin: 0;">Si no has solicitado esta recuperación, puedes ignorar este mensaje.</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="divider_block block-6" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #dddddd;"><span>&#8202;</span></td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-7" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#000000;direction:ltr;font-family:'Roboto', Tahoma, Verdana, Segoe, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:center;mso-line-height-alt:16.8px;">
																	<p style="margin: 0;">Everchic - Todos los derechos reservados</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="social_block block-8" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table class="social-table" width="72px" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;">
																		<tr>
																			<td style="padding:0 2px 0 2px;"><a href="https://www.facebook.com/everchicsa" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/facebook@2x.png" width="32" height="auto" alt="Facebook" title="facebook" style="display: block; height: auto; border: 0;"></a></td>
																			<td style="padding:0 2px 0 2px;"><a href="https://www.instagram.com/ever_chic_" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/instagram@2x.png" width="32" height="auto" alt="Instagram" title="instagram" style="display: block; height: auto; border: 0;"></a></td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
		</tbody>
	</table><!-- End -->
</body>

</html>
        `
	};

	// Enviamos el correo electrónico
	try {
		await sendEmail(mailOptions);
		return res.json({ message: "Se ha enviado un correo de recuperación" });
	} catch (error) {
		console.error('Error al enviar el correo electrónico:', error);
		return res.status(500).json({ message: "Error al enviar el correo de recuperación" });
	}
});



//Endpoint Update password
const updatePassword = catchError(async (req, res) => {
	const { token, password } = req.body;
	// Verificar y decodificar el token
	let decoded;
	try {
		decoded = jwt.verify(token, process.env.TOKEN_SECRET);
	} catch (err) {
		return res.status(400).json({ message: "Token inválido o expirado" });
	}

	// Buscar al usuario en la base de datos
	const user = await User.findOne({ where: { id: decoded.id } });
	if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

	// Hash de la nueva contraseña
	const hash = await bcrypt.hash(password, 10);

	// Actualizar la contraseña en la base de datos
	await User.update({ password: hash }, { where: { id: decoded.id } });

	return res.json({ message: "Contraseña actualizada" });
});

//Endpoint getAll likes
const getLikes = catchError(async (req, res) => {
	try {
		const { id } = req.params;
		const likes = await ProductLike.findAll({ where: { userId: id } });
		return res.json(likes);
	} catch (error) {
		console.error("Error al obtener likes:", error);
		return res.status(500).json({ error: "Error al obtener likes o no tenga likes" });
	}
});





//Endpoint handle Like 
const upgradeLike = catchError(async (req, res) => {
	try {
		const { userId, productId } = req.body;
		//buscar el like si existe 
		const like = await ProductLike.findOne({ where: { userId: userId, productId: productId } })
		if (like) {
			await like.destroy();
			return res.json({ message: "Like eliminado" });
		} else {
			await ProductLike.create({ userId: userId, productId: productId });
			return res.json({ message: "Like agregado" });
		}
	} catch (error) {
		console.error("Error al actualizar like:", error);
	}
});

module.exports = {
	getOne,
	getAll,
	createUser,
	remove,
	update,
	login,
	verifyEmail,
	recoverPassword,
	updatePassword,
	getLikes,
	upgradeLike,
	resendVerification,
	validateSession,
	limiter

}