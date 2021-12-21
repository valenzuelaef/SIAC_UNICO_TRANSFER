using Claro.SIACU.App.Transfer.Areas.Transfer.Utils;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Claro.SIACU.App.Transfer.Areas.Transfer.Models.DatosAdicionales;
using Claro.SIACU.App.Transfer.Areas.Transfer.Models.FranjaHoraria;
using Claro.SIACU.App.Transfer.Areas.Transfer.Models.CargaInicialCustomers;
using Claro.SIACU.App.Transfer.Areas.Transfer.Models.Transversal;
using Claro.SIACU.App.Transfer.Areas.Transfer.Models.GestionCuadrillas;

namespace Claro.SIACU.App.Transfer.Areas.Transfer.Controllers
{

    public class HomeController : Controller
    {
        static DatosAdicionalesResponse oDatosAdi = new DatosAdicionalesResponse();
 
        static List<Ubicaciones> listUbicaciones
            = new List<Ubicaciones>();

        static List<ListaTipoInterior> listTipoInterior
            = new List<ListaTipoInterior>();

        static List<ListaTipoVia> listTipoVias
            = new List<ListaTipoVia>();

        static List<TipoUrbanizacion> listTipoUrbanizacion
            = new List<TipoUrbanizacion>();

        static List<ListaCentroPoblados> listCentroPoblados
         = new List<ListaCentroPoblados>();

        static List<ListaPlanos> listPlanos
        = new List<ListaPlanos>();

        static List<ListaEdificios> listEdificios
      = new List<ListaEdificios>();

        static List<ListaTiposTrabajo> listTipoTrabajo
         = new List<ListaTiposTrabajo>();

        static List<ListaSubTiposTrabajo> listsubTipoTrabajo
        = new List<ListaSubTiposTrabajo>();

        static ValidaEta listValidaEta
               = new ValidaEta();

        static List<Motivos> listMotivos
       = new List<Motivos>();

        static string stridSession;
        static string codEstado;
        static string codProvincia;
        static string codDistrito;
        static string codPoblados;
        static byte[] databytesFile;
        //static string strIpSession = Utils.Common.GetApplicationIp();
        static string strIpSession = "172.19.84.167";

        public ActionResult Index()
        {
            return PartialView();
        }

        public ActionResult CustomerData()
        {
            return PartialView();
        }

        [HttpGet]
        public ActionResult Scheduling()
        {
            return PartialView("Scheduling");
        }

        [HttpGet]
        public ActionResult SchedulingInternal()
        {
            return PartialView("SchedulingInternal");
        }

        public ActionResult ChoosePlane()
        {
            return PartialView("ChoosePlane");
        }

        public ActionResult ChooseBuilding()
        {
            return PartialView("ChooseBuilding");
        }

        public ActionResult Summary()
        {
            return PartialView("Summary");
        }

        public ActionResult ConsultationCoverage()
        {
            return PartialView("ConsultationCoverage");
        }

        public ActionResult ServiciosAdicionales()
        {
            return PartialView("ServiciosAdicionalesCustomerData");
        }

        public ActionResult RenderPartialView(string partialView)
        {
            return PartialView(partialView);
        }

        public void void_CargaControlListas(Models.DatosAdicionales.DatosAdicionalesResponse oDatosAcicionalesDataResponse, string idTransaccion, string idProceso)
        {
            var entidad = oDatosAcicionalesDataResponse.MessageResponse.Body.servicios;

            ///Carga para la informacion de lado derecho (Primer Wizard)
            if (/*idTransaccion == "3" &&*/ idProceso == "1")
            {
                    listUbicaciones  = entidad.ubicaciones_obtenerUbicaciones.CodigoRespuesta == "0" ?
                         entidad.ubicaciones_obtenerUbicaciones.listaUbicaciones.ToList() : null;

                    listTipoInterior = entidad.tiposubicacion_obtenerTiposInterior.CodigoRespuesta == "0" ?
                        entidad.tiposubicacion_obtenerTiposInterior.listaTipoInterior.ToList() : null;

                listTipoVias = entidad.tiposubicacion_obtenerTiposVia.CodigoRespuesta == "0" ?
                    entidad.tiposubicacion_obtenerTiposVia.listaTipoVia.ToList() : null;

                    listTipoUrbanizacion = entidad.tiposubicacion_obtenerTiposUrbanizacion.CodigoRespuesta == "0" ?
                        entidad.tiposubicacion_obtenerTiposUrbanizacion.listaTipoUrbanizacion.ToList() : null;
            }

            ///Carga para la informacion de lado derecho CP, PLANOS, EDIFICIOS
            if (/*idTransaccion == "3" &&*/ idProceso == "2")
            {

                listCentroPoblados = entidad.complementosubicacion_obtenerCentrosPoblados.CodigoRespuesta == "0" ?
                    entidad.complementosubicacion_obtenerCentrosPoblados.listaCenPob.ToList() : null;

                listPlanos = entidad.complementosubicacion_obtenerPlanos.CodigoRespuesta == "0" ?
                        entidad.complementosubicacion_obtenerPlanos.listaPlanos.ToList() : null;

                listEdificios = entidad.complementosubicacion_obtenerNombreEdificios.CodigoRespuesta == "0" ?
                    entidad.complementosubicacion_obtenerNombreEdificios.ListaEdificio.ToList() : null;


            }

            ///Tipo y SubTipo de Trabajo
            if (/*idTransaccion == "3" &&*/ idProceso == "3")
            {
                listTipoTrabajo = entidad.tipostrabajo_consultarTipoTrabajo.codigoRespuesta == "0" ?
                    entidad.tipostrabajo_consultarTipoTrabajo.listatipotrabajo.ToList() : null;

                listsubTipoTrabajo = entidad.consultasubtipo.CodigoRespuesta == "0" ?
                    entidad.consultasubtipo.listaSubTipo.ToList() : null;

                listMotivos = entidad.consultamotivo.CodResp == "0" ?
                    entidad.consultamotivo.listaMotivos.ToList() : null;

                listValidaEta = entidad.franjahorario_validaEta.ValidaEta;
            }

        }

        [HttpPost]
        public JsonResult GetDatosAdicionales(DatosAdicionalesBodyRequest request)
        {
            string strUrl = ConfigurationManager.AppSettings["DPGetObtenerDatosAcionales"];
            Models.DatosAdicionales.DatosAdicionalesRequest oDatosAcicionalesDataRequest = new Models.DatosAdicionales.DatosAdicionalesRequest();
            Models.DatosAdicionales.DatosAdicionalesResponse oDatosAcicionalesDataResponse = new Models.DatosAdicionales.DatosAdicionalesResponse();

            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(stridSession);

            oDatosAcicionalesDataRequest.Audit = oAuditRequest;

            oDatosAcicionalesDataRequest.MessageRequest = new Models.DatosAdicionales.DatosAdicionalesMessageRequest
            {
                Header = new Models.DataPower.HeaderReq
                {
                    HeaderRequest = new Models.DataPower.HeaderRequest
                      {
                        consumer = "TCRM",
                        country = "PERU",
                        dispositivo = "MOVIL",
                        language = "ES",
                        modulo = "OM",
                        msgType = "REQUEST",
                          operation = "obtenerDatosInicialAdicionales",
                        pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                        system = "SIACU",
                        timestamp = DateTime.Now.ToString("o"),
                        userId = Utils.Common.CurrentUser,
                        wsIp = strIpSession
                    }
                },
                Body = new Models.DatosAdicionales.DatosAdicionalesBodyRequest
                {
                    IdTransaccion = request.IdTransaccion,
			        IdProceso = request.IdProceso,
                    IdProducto = request.IdProducto == null ? "" : request.IdProducto,
                    CodPais = request.CodPais == null ? "" : request.CodPais,
                    IdTipoUrba = request.IdTipoUrba == null ? "" : request.IdTipoUrba,
			        ContratoId = request.ContratoId == null  ? "" : request.ContratoId,
			        IdTipoInt  = request.IdTipoInt == null  ? "" : request.IdTipoInt,
                    IdCodVia = request.IdCodVia == null ? "" : request.IdCodVia,
                    CodUbi = request.CodUbi == null ? "" : request.CodUbi,
                    Ubigeo = request.Ubigeo == null ? "" : request.Ubigeo,
                    IdPoblado = request.IdPoblado == null ? "" : request.IdPoblado,
                    TipTrabajo = request.TipTrabajo == null ?  "" : request.TipTrabajo,
                    FlagCE = request.FlagCE == null ? "" : request.FlagCE,
                    TipoServicio = request.TipoServicio == null ? "" : request.TipoServicio,
                    TipTra = request.TipTra == null ? "" : request.TipTra,
                    Origen = request.Origen == null ? "" : request.Origen,
                    IdPlano = request.IdPlano == null ? "" : request.IdPlano,
                    tecnologia = request.IdProducto == null ? "" : request.IdProducto,
                    customerId = request.customerId == null ? "" : request.customerId,
                    canal = string.Empty,
                    cantDeco = request.cantDeco == null ? "" : request.cantDeco,
                    flagConvivencia = ConfigurationManager.AppSettings["flagConvivenciaAsIsToBeReingFija"]
                }
            };

            try
            {
                Tools.Traces.Logging.Info(stridSession, oDatosAcicionalesDataRequest.Audit.Transaction, "Request GetDatosAdicionales DP PostTransfer: " + JsonConvert.SerializeObject(oDatosAcicionalesDataRequest));
                oDatosAcicionalesDataResponse = Utils.RestService.PostInvoque<Models.DatosAdicionales.DatosAdicionalesResponse>(strUrl, oDatosAcicionalesDataRequest.Audit, oDatosAcicionalesDataRequest, true);
                Tools.Traces.Logging.Info(stridSession, oDatosAcicionalesDataRequest.Audit.Transaction, "Response GetDatosAdicionales DP PostTransfer: " + JsonConvert.SerializeObject(oDatosAcicionalesDataResponse));
                oDatosAdi = oDatosAcicionalesDataResponse;
                this.void_CargaControlListas(oDatosAcicionalesDataResponse, request.IdTransaccion, request.IdProceso);
            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(stridSession, oDatosAcicionalesDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
                oDatosAcicionalesDataResponse = JsonConvert.DeserializeObject<Models.DatosAdicionales.DatosAdicionalesResponse>(result);
            }

               return Json(new
                {
                 data = oDatosAcicionalesDataResponse,
                }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public JsonResult GetDatosFranjaHorario(FranjaHorariaBodyRequest request)
        {
            string strUrl = ConfigurationManager.AppSettings["DPGetObtenerFranjaHorario"];
            Models.FranjaHoraria.FranjaHorariaRequest oDataRequest = new Models.FranjaHoraria.FranjaHorariaRequest();
            Models.FranjaHoraria.FranjaHorariaResponse oDataResponse = new Models.FranjaHoraria.FranjaHorariaResponse();
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(stridSession);

            oDataRequest.Audit = oAuditRequest;

            oDataRequest.MessageRequest = new Models.FranjaHoraria.FranjaHorariaMessageRequest
            {
                Header = new Models.DataPower.HeaderReq
                {
                    HeaderRequest = new Models.DataPower.HeaderRequest
                    {
                        consumer = "TCRM",
                        country = "PERU",
                        dispositivo = "MOVIL",
                        language = "ES",
                        modulo = "sisact",
                        msgType = "REQUEST",
                        operation = "obtenerFranjaHorario",
                        pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                        system = "SIAC",
                        timestamp = DateTime.Now.ToString("o"),
                        userId = Utils.Common.CurrentUser,
                        wsIp = strIpSession
                    }
                },
                Body = new Models.FranjaHoraria.FranjaHorariaBodyRequest
                {
                    FlagValidaEta = request.FlagValidaEta,
                    Disponibilidad = request.Disponibilidad,
                    TipTra = request.TipTra,
                    TipSrv = request.TipSrv,
                    FechaAgenda = request.FechaAgenda,
                    Origen = request.Origen,
                    IdPlano = request.IdPlano,
                    Ubigeo = request.Ubigeo,
                    TipoOrden = request.TipoOrden,
                    CodZona = request.CodZona,
                    Customer = request.Customer,
                    Contrato = request.Contrato,
                    ReglaValidacion = request.ReglaValidacion,
                    listaCampoActividadCapacidad = request.listaCampoActividadCapacidad
                }
            };

            try
            {
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Request GetDatosFranjaHorario DP PostTransfer: " + JsonConvert.SerializeObject(oDataRequest));
                oDataResponse = Utils.RestService.PostInvoque<Models.FranjaHoraria.FranjaHorariaResponse>(strUrl, oDataRequest.Audit, oDataRequest, true);
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Response GetDatosFranjaHorario DP PostTransfer: " + JsonConvert.SerializeObject(oDataResponse));


            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(stridSession, oDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
                oDataResponse = JsonConvert.DeserializeObject<Models.FranjaHoraria.FranjaHorariaResponse>(result);
            }
            return Json(new
            {
                dataCapacity = oDataResponse,
            }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public void PostParamsCentroPoblados(string CodEstado, string CodProvincia, string CodDistriro, string codPoblado)
        {
            codEstado = CodEstado;
            codProvincia = CodProvincia;
            codDistrito = CodDistriro;
            codPoblados = codPoblado;
        }

         [HttpPost]
         public JsonResult GetEdificios()
         {
            return Json(new { data = listEdificios });
         }

        [HttpPost]
        public JsonResult GetPlanos(string tipoProducto)
        {


            var codUbi = listUbicaciones.Where(x =>
                                                       x.CodProvincia == codProvincia &&
                                                       x.CodEstado == codEstado &&
                                                       x.CodDistrito == codDistrito).Select(x => x.codUbigeo).FirstOrDefault();

            var Ubigeo = listUbicaciones.Where(x =>
                                                         x.CodProvincia == codProvincia &&
                                                         x.CodEstado == codEstado &&
                                                         x.CodDistrito == codDistrito).Select(x => x.Ubigeo).FirstOrDefault();

            var idPoblado = listCentroPoblados.Where(x =>
                                                       x.Ubigeo == Ubigeo).Select(x => x.IdPoblado).FirstOrDefault();

            listPlanos = null;
            listEdificios = null;


            this.GetDatosAdicionales(new DatosAdicionalesBodyRequest
            {
                IdTransaccion = "3",
                IdProceso = "2",
                IdProducto = tipoProducto,
                CodPais = "51",
                CodUbi = codUbi,
                Ubigeo = Ubigeo,
                IdPoblado = idPoblado
            });

            if (listPlanos != null)
            {
                return Json(new { data = listPlanos, success = true });
            }
            return Json(new { data = listPlanos, success = false });
        }

        [HttpPost]
        public JsonResult GetCentroPoblados(string CodEstado, string CodProvincia, string CodDistriro, string tipoProducto)
        {


            var codUbi = listUbicaciones.Where(x =>
                                                       x.CodProvincia == CodProvincia &&
                                                        x.CodEstado == CodEstado &&
                                                        x.CodDistrito == CodDistriro).Select(x => x.codUbigeo).FirstOrDefault();

             var   Ubigeo = listUbicaciones.Where(x =>
                                                          x.CodProvincia == CodProvincia &&
                                                          x.CodEstado == CodEstado &&
                                                          x.CodDistrito == CodDistriro).Select(x => x.Ubigeo).FirstOrDefault();

             this.GetDatosAdicionales(new DatosAdicionalesBodyRequest
             {
                 IdTransaccion = "3",
                 IdProceso = "2",
                 IdProducto = tipoProducto,
                 CodPais = "51",
                 CodUbi = codUbi,
                 Ubigeo = Ubigeo,
                Origen = "P"
             });

            List<Utils.GenericItem> SelectList = new List<Utils.GenericItem>();

            foreach (var item in listCentroPoblados)
            {
                SelectList.Add(new Utils.GenericItem()
                {
                    Code = item.IdPoblado,
                    Description = item.Nombre
                });
            }

            return Json(new { data = SelectList.Distinct() });
        }

        [HttpPost]
        public JsonResult GetTiposDeTrabajo(DatosAdicionalesBodyRequest orequest)
        {

            List<Utils.GenericItem> SelectListMotivos = new List<Utils.GenericItem>();
            List<Utils.GenericItem> SelectListTipoTrabajo = new List<Utils.GenericItem>();
            List<Utils.GenericItem> SelectListSubTipoTrabajo = new List<Utils.GenericItem>();

            try
            {
                this.GetDatosAdicionales(orequest);

                foreach (var item in listTipoTrabajo)
                {
                      SelectListTipoTrabajo.Add(new Utils.GenericItem()
                    {

                        Code = item.TipoTrabajo,
                        Code2 = item.FlagFranja,
                        Description = item.Descripcion
                    });
                }

                   foreach (var item in listsubTipoTrabajo)
                {
                    SelectListSubTipoTrabajo.Add(new Utils.GenericItem()
                    {

                        Code = item.CodSubTipoOrden,
                        Code2 = item.TipoServicio,
                        Code3 = item.flagDefecto,
                        Description = item.Descripcion,
                        Description2 = item.tiempoMin,
                        Type = item.IdSubTipoOrden,//PILOTO-Varillas
                        IdMotive =item.CodTipoOrden//Validar
                    });
                }

                foreach (var item in listMotivos)
                {
                    SelectListMotivos.Add(new Utils.GenericItem()
                    {

                        Code = item.CodMotivo,
                        Description = item.Descripcion
                    });
                }

                return Json(new { succes = true, SelectListMotivos, SelectListTipoTrabajo, SelectListSubTipoTrabajo, listValidaEta });
            }
            catch (Exception ex)
            {
                return Json(new { succes = false, mensaje = ex.Message.ToString() });
            }

        }

        [HttpPost]
        public JsonResult GetTiposUrbanizacion()
        {
            List<Utils.GenericItem> SelectList = new List<Utils.GenericItem>();

            var oEntidad = listTipoUrbanizacion;

            foreach (var item in oEntidad)
            {
                SelectList.Add(new Utils.GenericItem()
                {

                    Code = item.IdTipUrb,
                    Description = item.Descripcion
                });
            }

            return Json(new { data = SelectList.Distinct() });
        }

        [HttpPost]
        public JsonResult GetTiposVias()
        {
            List<Utils.GenericItem> SelectList = new List<Utils.GenericItem>();

            var oEntidad = listTipoVias;

            foreach (var item in oEntidad)
            {
                 SelectList.Add(new Utils.GenericItem()
                {

                    Code = item.CodVia,
                    Description = item.DesVia
                });
            }

            return Json(new { data = SelectList.Distinct() });
        }

        [HttpPost]
        public JsonResult GetBloquesTiposZonas(string tipoInterior)
        {
            List<Utils.GenericItem> SelectList = new List<Utils.GenericItem>();

            var oEntidad = listTipoInterior.Where(x => x.Tipo == tipoInterior).Select(x => x.IdTipo).ToList();

            foreach (var item in oEntidad)
            {
                var descrip = listTipoInterior.Where(x => x.IdTipo == item &&
                                            x.Tipo == tipoInterior).Select(x => x.Descripcion).Distinct().FirstOrDefault();

                SelectList.Add(new Utils.GenericItem()
                {

                    Code = item,
                    Description = descrip
                });
            }

            return Json(new { data = SelectList.Distinct() });
        }
       
        [HttpPost]
        public JsonResult GetInitialConfiguration(Models.InitialData.InitialDataBodyRequest oBodyRequest, string SessionID, string TransactionID)
        {

            oDatosAdi = new DatosAdicionalesResponse();
            Models.InitialData.InitialDataRequest oInitialDataRequest = new Models.InitialData.InitialDataRequest();
            Models.InitialData.AdditionalFixedDataRequest oDatosAdicionalesDataRequest = new Models.InitialData.AdditionalFixedDataRequest();
            Models.InitialData.InitialDataResponse oInitialDataResponse = new Models.InitialData.InitialDataResponse();
            Models.InitialData.AdditionalFixedDataResponse oAdditionalFixedDataResponse = new Models.InitialData.AdditionalFixedDataResponse();
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(SessionID);
            stridSession = SessionID;
            Dictionary<string, string> oConfiguraciones = new Dictionary<string, string>();

            try
            {
                  string strUrl = ConfigurationManager.AppSettings["DPGetCargaDatosClienteFija"];
                  oInitialDataRequest.Audit = oAuditRequest;
                  oInitialDataRequest.MessageRequest = new Models.InitialData.InitialDataMessageRequest
                  {
                      Header = new Models.DataPower.HeaderReq
                      {
                          HeaderRequest = new Models.DataPower.HeaderRequest
                          {
                              consumer = "SIACU",
                              country = "PE",
                              dispositivo = "MOVIL",
                              language = "ES",
                              modulo = "siacu",
                              msgType = "Request",
                              operation = "obtenerDatosInicial",
                              pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                              system = "SIACU",
                              timestamp = DateTime.Now.ToString("o"),
                              userId = Utils.Common.CurrentUser,
                              wsIp = strIpSession
                          }
                      },
                      Body = new Models.InitialData.InitialDataBodyRequest
                      {
                          ContractID = oBodyRequest.ContractID,
                          CustomerID = oBodyRequest.CustomerID,
                          UserAccount = oBodyRequest.UserAccount,
                          codeRol = oBodyRequest.codeRol,
                          codeCac = oBodyRequest.codeCac,
                          state = oBodyRequest.state,
                          Type = oBodyRequest.Type,
                          flagConvivencia = ConfigurationManager.AppSettings["flagConvivenciaAsIsToBeReingFija"]
                      }
                  };
                  Tools.Traces.Logging.Info(SessionID, oInitialDataRequest.Audit.Transaction, "Request: " + JsonConvert.SerializeObject(oInitialDataRequest));
                  oInitialDataResponse = Utils.RestService.PostInvoque<Models.InitialData.InitialDataResponse>(strUrl, oInitialDataRequest.Audit, oInitialDataRequest, true);
                  Tools.Traces.Logging.Info(SessionID, oInitialDataRequest.Audit.Transaction, "Response: " + JsonConvert.SerializeObject(oInitialDataResponse));

                  var oPointAttention = new PuntoAtencionResponse();
                  if (oInitialDataResponse.MessageResponse != null)
                  {
                          if (oInitialDataResponse.MessageResponse.Body != null)
                      {
                              oPointAttention = oInitialDataResponse.MessageResponse.Body.PuntoAtencion;
                              if (oPointAttention != null)
                          {
                                  if (oPointAttention.CodigoRespuesta == "0")
                              {
                                      oInitialDataResponse.MessageResponse.Body.PuntoAtencion.listaRegistros = oPointAttention.listaRegistros.OrderBy(x => x.nombre).ToList();
                              }
                          }
                      }
                  }
                  if (!string.IsNullOrEmpty(oInitialDataResponse.MessageResponse.Body.CoreServices.Technology)) {                   
                     this.GetDatosAdicionales(new DatosAdicionalesBodyRequest
                      {
                          IdTransaccion = TransactionID,// "3",
                          IdProceso = "1",
                          IdProducto = oInitialDataResponse.MessageResponse.Body.CoreServices.Technology,
                          CodPais = "51",
                          IdTipoUrba = "0",
                          ContratoId = oBodyRequest.ContractID,
                          customerId = oBodyRequest.CustomerID,
                          IdTipoInt = "TODOS",
                          IdCodVia = "0",
                          CodUbi = "",
                          Ubigeo = "",
                          IdPoblado = ""
                      });

                      if (oInitialDataResponse.MessageResponse.Body.CoreServices.Technology != "9")
                          oDatosAdi.MessageResponse.Body.servicios.tipificacionreglas_obtenerInformacionTipificacion.listaTipificacionRegla =
                                   oDatosAdi.MessageResponse.Body.servicios.tipificacionreglas_obtenerInformacionTipificacion.listaTipificacionRegla.OrderBy(x => x.SubClaseCodigo).ToList();

                     foreach (var item in oDatosAdi.MessageResponse.Body.servicios.configuracionesfija_obtenerConfiguraciones.ProductTransaction.ConfigurationAttributes.Where(x => x.AttributeType == "CONFIGURACIONES"))
                     {
                         oConfiguraciones[item.AttributeName + "_" + item.AttributeIdentifier] = item.AttributeValue;
                     }
                  } 
            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(SessionID, oInitialDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
                oInitialDataResponse = JsonConvert.DeserializeObject<Models.InitialData.InitialDataResponse>(result);
            }

            return Json(new
            {
                oInitialDataResponse,
                oDatosAdi,
                oConfiguraciones,
                oAuditRequest
            }, JsonRequestBehavior.AllowGet);
        }

        public FileContentResult ShowRecordSharedFile(string strIdSession)
        {
            Tools.Entity.AuditRequest oAuditRequest = Common.CreateAuditRequest<Tools.Entity.AuditRequest>(strIdSession);
            byte[] databytes;
            string strContenType = "application/pdf";
            try
            {
                Tools.Entity.AuditRequest oAudit = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(strIdSession);
                databytes = databytesFile;
            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(strIdSession, oAuditRequest.Transaction, ex.Message);
                databytes = null;
            }

            return File(databytes, strContenType);
        }

        [HttpPost]
        public JsonResult postGeneraTransaccion(GuardarDatosDataBodyRequest request)
        {
            string strUrl = ConfigurationManager.AppSettings["DPGetGuardarDatosAgendamiento"];
            Models.Transversal.GuardarDatosRequest oDataRequest = new Models.Transversal.GuardarDatosRequest();
            Models.Transversal.GuardarDatosResponse oDataResponse = new Models.Transversal.GuardarDatosResponse();
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(stridSession);
            
            if (request.idFlujo == "TE")
            {
                request.idFlujo = request.TransactionID == Tools.Utils.Constants.NumberThreeString ? ConfigurationManager.AppSettings["IdFlujoTrasladoExternoFTTH"] : ConfigurationManager.AppSettings["IdFlujoTrasladoExternoFTTHONE"];
            }
            else 
            {
                request.idFlujo = request.TransactionID == Tools.Utils.Constants.NumberThreeString ? ConfigurationManager.AppSettings["IdFlujoTrasladoInternoFTTH"] : ConfigurationManager.AppSettings["IdFlujoTrasladoInternoFTTHONE"];
            }

            oDataRequest.Audit = oAuditRequest;

            oDataRequest.MessageRequest = new Models.Transversal.GuardarDatosDataMessageRequest
            {
                Header = new Models.DataPower.HeaderReq
                {
                    HeaderRequest = new Models.DataPower.HeaderRequest
                    {
                        consumer = "TCRM",
                        country = "PE",
                        dispositivo = "MOVIL",
                        language = "ES",
                        modulo = "sisact",
                        msgType = "REQUEST",
                        operation = "GeneraTransaccion",
                        pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                        system = "SIACU",
                        timestamp = DateTime.Now.ToString("o"),
                        userId = Utils.Common.CurrentUser,
                        wsIp = strIpSession
                    }
                },
                Body = new Models.Transversal.GuardarDatosDataBodyRequest
                {
                    idFlujo = request.idFlujo,
                   Servicios = request.Servicios
                }
            };

            var xsucces = false;

            //Encriptamos a base64 la notas -  Tipificacion
            request.Servicios.Where(m => m.servicio == "Tipificacion")
           .Select(m => new Models.Transversal.Servicios
           {
               servicio = m.servicio,
               parametros = m.parametros.Where(u => u.parametro == "Notas").ToList()
           }).ToList().ForEach(y => y.parametros.FirstOrDefault().valor = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(y.parametros.FirstOrDefault().valor)));

            //Encriptamos a base64 la inter_30 - Tipificacion
            request.Servicios.Where(m => m.servicio == "Plantilla")
           .Select(m => new Models.Transversal.Servicios
           {
               servicio = m.servicio,
               parametros = m.parametros.Where(u => u.parametro == "inter30").ToList()
           }).ToList().ForEach(y => y.parametros.FirstOrDefault().valor = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(y.parametros.FirstOrDefault().valor)));

            //Encriptamos a base64 la Constancia
            request.Servicios.Where(m => m.servicio == "Constancia")
                .Select(m => new Models.Transversal.Servicios
                {
                    servicio = m.servicio,
                    parametros = m.parametros.Where(u => u.parametro == "DRIVE_CONSTANCIA").ToList()
                })
               .ToList().ForEach(y => y.parametros.FirstOrDefault().valor = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(y.parametros.FirstOrDefault().valor)));
            //Encriptamos a base64 Trama_Venta
            request.Servicios.Where(m => m.servicio == "Tramas")
                .Select(m => new Models.Transversal.Servicios
                {
                    servicio = m.servicio,
                    parametros = m.parametros.Where(u => u.parametro == "Trama_Ventas").ToList()
                })
               .ToList().ForEach(y => y.parametros.FirstOrDefault().valor = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(y.parametros.FirstOrDefault().valor)));

            try
            {
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Request postGeneraTransaccion DP PostTransfer: " + JsonConvert.SerializeObject(oDataRequest));
                oDataResponse = Utils.RestService.PostInvoque<Models.Transversal.GuardarDatosResponse>(strUrl, oDataRequest.Audit, oDataRequest, true);
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Response postGeneraTransaccion DP PostTransfer: " + JsonConvert.SerializeObject(oDataResponse));
                xsucces = true;

                /**********************************************************
                 *  CONTROL DE ERROR PARA GENERAR CONSTANCIA
                 *  SI HAY ERROR EN CONSTACIA, QUE SIGA EL FLUJO 
                 *  DE ITERACION CON EL USUARIO
                 *  ANTES EL LOADING SE QUEDABA CARGANDO
                ***********************************************************/
                try
                {
                 databytesFile = Convert.FromBase64String(oDataResponse.MessageResponse.Body.constancia);
                oDataResponse.MessageResponse.Body.constancia = "";
                }
                catch (Exception ex)
                {
                    xsucces = true; 
                    Tools.Traces.Logging.Error(stridSession, oDataRequest.Audit.Transaction, ex.Message);
                    string sep = " - ";
                    int posResponse = ex.Message.IndexOf(sep);
                    string result = ex.Message.Substring(posResponse + sep.Length);
                }
                
            }
            catch (Exception ex)
            {
                xsucces = false;
                Tools.Traces.Logging.Error(stridSession, oDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
            }

            return Json(new
            {
                succes = xsucces,
                data = oDataResponse,
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult GestionarCancelarTOA(CancelarTOABodyRequest oBodyRequest)
        {

            string strUrl = ConfigurationManager.AppSettings["DPGetGestionarCuadrillaCancelar"];
            CancelarTOARequest oDataRequest = new CancelarTOARequest();
            CancelarTOAResponse oDataResponse = new CancelarTOAResponse();
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(stridSession);

            try
            {

                oDataRequest.Audit = oAuditRequest;
                oDataRequest.MessageRequest = new CancelarTOAMessageRequest
                {
                    Header = new Models.DataPower.HeaderReq
                    {
                        HeaderRequest = new Models.DataPower.HeaderRequest
                        {
                            consumer = "SIACU",
                            country = "PE",
                            dispositivo = "MOVIL",
                            language = "ES",
                            modulo = "siacu",
                            msgType = "Request",
                            operation = "GestionarCancelarTOA",
                            pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                            system = "SIACU",
                            timestamp = DateTime.Now.ToString("o"),
                            userId = Utils.Common.CurrentUser,
                            wsIp = strIpSession
                        }
                    },
                    Body = new CancelarTOABodyRequest
                    {
                        nroOrden = oBodyRequest.nroOrden == null ? "" : oBodyRequest.nroOrden
                    }
                };

                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Request GestionarCancelarTOA: " + JsonConvert.SerializeObject(oDataRequest));
                oDataResponse = Utils.RestService.PostInvoque<CancelarTOAResponse>(strUrl, oDataRequest.Audit, oDataRequest, true);
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Response GestionarCancelarTOA: " + JsonConvert.SerializeObject(oDataResponse));
            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(stridSession, oDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
                oDataResponse = JsonConvert.DeserializeObject<CancelarTOAResponse>(result);
            }

            return Json(new
            {
                oDataRequest
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult GestionarReservaTOA(ReservaTOABodyRequest oBodyRequest)
        {
            string strUrl = ConfigurationManager.AppSettings["DPGetGestionarCuadrillaReservar"];
            ReservaTOARequest oDataRequest = new ReservaTOARequest();
            ReservaTOAResponse oDataResponse = new ReservaTOAResponse();
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(stridSession);

           try
            {

                    oDataRequest.Audit = oAuditRequest;
                    oDataRequest.MessageRequest = new ReservaTOAMessageRequest
                    {
                        Header = new Models.DataPower.HeaderReq
                        {
                            HeaderRequest = new Models.DataPower.HeaderRequest
                            {
                                consumer = "SIACU",
                                country = "PE",
                                dispositivo = "MOVIL",
                                language = "ES",
                                modulo = "siacu",
                                msgType = "Request",
                            operation = "GestionarReservaTOA",
                                pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                                system = "SIACU",
                                timestamp = DateTime.Now.ToString("o"),
                                userId = Utils.Common.CurrentUser,
                                wsIp = strIpSession
                            }
                        },
                    Body = new ReservaTOABodyRequest
                        {
                            codSubTipoOrden = oBodyRequest.codSubTipoOrden == null ? "" : oBodyRequest.codSubTipoOrden,
                            codZona = oBodyRequest.codZona == null ? "" : oBodyRequest.codZona,
                        duracion = oBodyRequest.duracion == null ? "" : oBodyRequest.duracion,
                            fechaReserva = oBodyRequest.fechaReserva == null ? "" : oBodyRequest.fechaReserva,
                        flagValidaETA = oBodyRequest.flagValidaETA == null ? "" : oBodyRequest.flagValidaETA,
                            franjaHoraria = oBodyRequest.franjaHoraria == null ? "" : oBodyRequest.franjaHoraria,
                            idBucket = oBodyRequest.idBucket == null ? "" : oBodyRequest.idBucket,
                        idConsulta = oBodyRequest.idConsulta == null ? "" : oBodyRequest.idConsulta,
                            idPlano = oBodyRequest.idPlano == null ? "" : oBodyRequest.idPlano,
                            nroOrden = oBodyRequest.nroOrden == null ? "" : oBodyRequest.nroOrden,
                            tipoOrden = oBodyRequest.tipoOrden == null ? "" : oBodyRequest.tipoOrden,
                            tipSrv = oBodyRequest.tipSrv == null ? "" : oBodyRequest.tipSrv,
                            tiptra = oBodyRequest.tiptra == null ? "" : oBodyRequest.tiptra
                        }
                    };

                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Request GestionarReservaTOA: " + JsonConvert.SerializeObject(oDataRequest));
                    oDataResponse = Utils.RestService.PostInvoque<ReservaTOAResponse>(strUrl, oDataRequest.Audit, oDataRequest, true);
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Response GestionarReservaTOA: " + JsonConvert.SerializeObject(oDataResponse));
            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(stridSession, oDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
                oDataResponse = JsonConvert.DeserializeObject<ReservaTOAResponse>(result);
            }

            return Json(new
            {
                oDataResponse = oDataResponse.MessageResponse.Body.auditResponse
            }, JsonRequestBehavior.AllowGet);
        }


    }
}