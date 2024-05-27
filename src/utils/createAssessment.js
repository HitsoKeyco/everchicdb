const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');
const fs = require('fs').promises;
const path = require('path');

/**
  * Crea una evaluación para analizar el riesgo de una acción de la IU.
  *
  * @param {Object} options - Opciones para la creación de la evaluación.
  * @param {string} options.projectID - El ID del proyecto de Google Cloud.
  * @param {string} options.recaptchaKey - La clave reCAPTCHA asociada con el sitio o la aplicación.
  * @param {string} options.token - El token generado obtenido del cliente.
  * @param {string} options.recaptchaAction - El nombre de la acción que corresponde al token.
  * @returns {Promise<number|null>} La puntuación de riesgo de la evaluación o null si falla.
  */
async function createAssessment ({
    projectID = "my-project-4600-1711262677177",
    recaptchaKey = "6LdS9qIpAAAAAEt_mCBaV0v4Sy9qel4YMi33ldla",
    token,
    recaptchaAction = "LOGIN",
}) 


{
    try {

        // Configura el cliente de reCAPTCHA con las credenciales cargadas
        const recaptchaClient = new RecaptchaEnterpriseServiceClient({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY,
            },
        });
        const projectPath = recaptchaClient.projectPath(projectID);

        // Crea la solicitud de evaluación.
        const request = {
            assessment: {
                event: {
                    token: token,
                    siteKey: recaptchaKey,
                },
            },
            parent: projectPath,
        };

        // Envía la solicitud de evaluación y espera la respuesta.
        const [response] = await recaptchaClient.createAssessment(request);

        // Verifica si el token es válido.
        if (!response.tokenProperties.valid) {
            console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties.invalidReason}`);
            return null;
        }

        // Verifica si se ejecutó la acción esperada.
        if (response.tokenProperties.action === recaptchaAction) {
            // Imprime la puntuación de riesgo y los motivos.
            console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
            response.riskAnalysis.reasons.forEach((reason) => {
                console.log(reason);
            });

            return response.riskAnalysis.score;
        } else {
            console.log("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
            return null;
        }
    } catch (error) {
        console.error("Error in createAssessment:", error);
        return null;
    }
}

module.exports = createAssessment;
