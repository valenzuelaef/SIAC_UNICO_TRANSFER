using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Tools.Traces;

namespace Claro.SIACU.App.Transfer.Areas.Transfer.Controllers
{
    public class RedirectController : Controller
    {
        //
        // GET: /Transfer/Redirect/
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Bridge(string secuencia)
        {
            ViewBag.sequence = secuencia;

            return View();
        }

        public JsonResult GetRedirect(string sequence)
        {
            string strServerName = System.Web.HttpContext.Current.Server.MachineName;
            string strNroNodo = string.Empty;

            string strUrl = ConfigurationManager.AppSettings["DPGetRedirect"];
            Models.Redirect.RedirectRequest oRedirectRequest = new Models.Redirect.RedirectRequest();
            Models.Redirect.RedirectResponse oRedirectResponse = new Models.Redirect.RedirectResponse();

            string strIdSession = Utils.Common.GetTransactionID();
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(strIdSession);
            oRedirectRequest.Audit = oAuditRequest;
            oRedirectRequest.MessageRequest = new Models.Redirect.RedirectMessageRequest
            {
                Header = new Models.DataPower.HeaderReq
                {
                    HeaderRequest = new Models.DataPower.HeaderRequest
                    {
                        consumer = "SIACU",
                        country = "PE",
                        dispositivo = "Movil",
                        language = "ES",
                        modulo = "siacu",
                        msgType = "Request",
                        operation = "validarComunicacion",
                        pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                        system = "SISACT",
                        timestamp = DateTime.Now.ToString("o"),
                        userId = System.Configuration.ConfigurationManager.AppSettings["USRProcesoSU"],// "usrsisactpost",
                        wsIp = "172.19.84.167"//Utils.Common.GetApplicationIp() // "172.19.84.167"
                    }
                },
                Body = new Models.Redirect.RedirectBodyRequest
                {
                    auditRequest = new Models.Redirect.auditBodyRequest
                    {

                        idTransaccion = oAuditRequest.Transaction,
                        ipAplicacion = oAuditRequest.idApplication,
                        nombreAplicacion = System.Configuration.ConfigurationManager.AppSettings["USRProcesoSU"],
                        usuarioAplicacion = Utils.Common.CurrentUser
                    },
                    secuencia = sequence,
                    ipServDestino = oAuditRequest.IPAddress
                }
            };

            Models.Redirect.RedirectResponse oRedirectBodyResponse = new Models.Redirect.RedirectResponse();
            try
            {
                Tools.Traces.Logging.Info(oAuditRequest.Session, oAuditRequest.Transaction, "IN GetRedirect() => RedirectMessageRequest" + JsonConvert.SerializeObject(oRedirectRequest));
                oRedirectBodyResponse = Utils.RestService.PostInvoque<Models.Redirect.RedirectResponse>(strUrl, oRedirectRequest.Audit, oRedirectRequest, true);
                oRedirectBodyResponse.MessageResponse.Body.strDestinationURL= "/transfer/Home/Index";
                Tools.Traces.Logging.Info(oAuditRequest.Session, oAuditRequest.Transaction, "OUT GetRedirect() => RedirectMessageResponse" + JsonConvert.SerializeObject(oRedirectBodyResponse));
            }
            catch (Exception ex)
            {
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);

                Tools.Traces.Logging.Error(oAuditRequest.Session, oAuditRequest.Transaction, "IN GetRedirect() => RedirectMessageRequest" + ex.Message);
            }

            if (strServerName.Length > 1)
            {
                strNroNodo = strServerName.Substring((strServerName.Length - 2), 2);
            }
            oRedirectBodyResponse.MessageResponse.Body.strNode = strNroNodo;
            oRedirectBodyResponse.MessageResponse.Body.strParameters = JsonConvert.SerializeObject(oRedirectBodyResponse.MessageResponse.Body.jsonParameters);

            return Json(oRedirectBodyResponse.MessageResponse.Body);
        }
    }
}