const User = require("../models/User");
const saveVerificationToken = require("./saveVerificationToken");
const { sendEmail } = require("./sendEmail");
const generateVerificationToken = require("./verifyToken");
const bcrypt = require('bcrypt')


const createUser = async( data ) => {
	
	const { dni, phone_first, phone_second, city, address, firstName, lastName, email, password } = data;

	const hashPassword = await bcrypt.hash(password, 10);
	//Verificar si es que el usuario ya existe en la base de datos 
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

	return newUser
};

module.exports =  { createUser }