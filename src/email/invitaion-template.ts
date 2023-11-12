import { type User, type Association, type Booking } from "@prisma/client";

const getEnvironmentSite = () => {
  const { hostname, protocol, port } = window.location;
  return `${protocol}//${hostname}${port ? ":" + port : ""}`;
};

type BuildHtmlTemplateInviteProps = {
  inviterName: string;
  emailInvited: string;
  association: Association;
};

export const buildHtmlInvitationTemplate = ({
  inviterName,
  emailInvited,
  association,
}: BuildHtmlTemplateInviteProps) => {
  /*   const title = "Invitation to join";
  const ingress = "Bla bla bla ingress"; */

  const style = `
  <style>
  /* -------------------------------------
    GLOBAL RESETS
------------------------------------- */

  /*All the styling goes here*/

  img {
      border: none;
      border-radius: none;
      box-shadow: none;
      -ms-interpolation-mode: bicubic;
      max-width: 100%;
  }

  body {
      background-color: #f6f6f6;
      font-family: sans-serif;
      -webkit-font-smoothing: antialiased;
      font-size: 14px;
      line-height: 1.4;
      margin: 0;
      padding: 0;
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
  }

  table {
      border-collapse: separate;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      width: 100%;
  }

  table td {
      font-family: sans-serif;
      font-size: 14px;
      vertical-align: top;
  }

  /* -------------------------------------
    BODY & CONTAINER
------------------------------------- */

  .body {
      background-color: #f6f6f6;
      width: 100%;
  }

  /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
  .container {
      display: block;
      margin: 0 auto !important;
      /* makes it centered */
      max-width: 580px;
      padding: 10px;
      width: 580px;

  }

  /* This should also be a block element, so that it will fill 100% of the .container */
  .content {
      box-sizing: border-box;
      display: block;
      margin: 0 auto;
      max-width: 580px;
      padding: 10px;
  }

  /* -------------------------------------
    HEADER, FOOTER, MAIN
------------------------------------- */
  .main {
      background: #ffffff;
      border-radius: 20px;
      width: 100%;
  }

  .wrapper {
      box-sizing: border-box;
      padding: 20px;
  }

  .content-block {
      padding-bottom: 10px;
      padding-top: 10px;
  }

  .footer {
      clear: both;
      margin-top: 10px;
      text-align: center;
      width: 100%;
  }

  .footer td,
  .footer p,
  .footer span,
  .footer a {
      color: #999999;
      font-size: 12px;
      text-align: center;
  }

  /* -------------------------------------
    TYPOGRAPHY
------------------------------------- */
  h1,
  h2,
  h3,
  h4 {
      color: #000000;
      font-family: sans-serif;
      font-weight: 400;
      line-height: 1.4;
      margin: 0;
      margin-bottom: 30px;
  }

  h1 {
      font-size: 35px;
      font-weight: 300;
      text-align: center;
      text-transform: capitalize;
  }

  p,
  ul,
  ol {
      font-family: sans-serif;
      font-size: 14px;
      font-weight: normal;
      margin: 0;
      margin-bottom: 15px;
  }

  p li,
  ul li,
  ol li {
      list-style-position: inside;
      margin-left: 5px;
  }

  a {
      color: white;
      text-decoration: underline;
  }

  /* -------------------------------------
    BUTTONS
------------------------------------- */
  .btn {
      box-sizing: border-box;
      width: 100%;
  }

  .btn>tbody>tr>td {
      padding-bottom: 15px;
  }

  .btn table {
      width: auto;
  }

  .btn table td {
      background-color: #ffffff;
      border-radius: 5px;
      text-align: center;
  }

  .btn a {
      border: solid 1px #3498db;
      border-radius: 5px;
      box-sizing: border-box;
      color: #3498db;
      cursor: pointer;
      display: inline-block;
      font-size: 14px;
      font-weight: bold;
      margin: 0;
      padding: 7px 15px;
      text-decoration: none;
      text-transform: capitalize;
  }

  .btn-primary table td {
      background-color: rgb(54, 211, 153);
  }

  .btn-primary a {
      background-color: rgb(54, 211, 153);
      border-color: rgb(54, 211, 153);
      color: #ffffff !important;
  }

  /* -------------------------------------
    OTHER STYLES THAT MIGHT BE USEFUL
------------------------------------- */
  .last {
      margin-bottom: 0;
  }

  .first {
      margin-top: 0;
  }

  .align-center {
      text-align: center;
  }

  .align-right {
      text-align: right;
  }

  .align-left {
      text-align: left;
  }

  .clear {
      clear: both;
  }

  .mt0 {
      margin-top: 0;
  }

  .mb0 {
      margin-bottom: 0;
  }

  .preheader {
      color: transparent;
      display: none;
      height: 0;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
      mso-hide: all;
      visibility: hidden;
      width: 0;
  }

  .powered-by a {
      text-decoration: none;
  }

  hr {
      border: 0;
      border-bottom: 1px solid #f6f6f6;
      margin: 20px 0;
  }


  .booking-info-item {
      padding: 5px;
      font-size: 18px;
  }

  .orange {
      color: orange;
  }

  /* -------------------------------------
    RESPONSIVE AND MOBILE FRIENDLY STYLES
------------------------------------- */
  @media only screen and (max-width: 620px) {
      table.body h1 {
          font-size: 28px !important;
          margin-bottom: 10px !important;
      }

      table.body p,
      table.body ul,
      table.body ol,
      table.body td,
      table.body span,
      table.body a {
          font-size: 16px !important;
      }

      table.body .wrapper,
      table.body .article {
          padding: 10px !important;
      }

      table.body .content {
          padding: 0 !important;
      }

      table.body .container {
          padding: 0 !important;
          width: 100% !important;
      }

      table.body.td .container {
          width: 375px !important;
          max-width: 580px !important;
      }

      table.body .main {
          border-left-width: 0 !important;
          border-radius: 0 !important;
          border-right-width: 0 !important;
      }

      table.body .btn table {
          display: flex;
          justify-content: center;
      }

      table.body .btn a {
          width: 100% !important;
      }

      table.body .img-responsive {
          height: auto !important;
          max-width: 100% !important;
          width: auto !important;
      }
  }

  /* -------------------------------------
    PRESERVE THESE STYLES IN THE HEAD
------------------------------------- */
  @media all {
      .ExternalClass {
          width: 100%;
      }

      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div {
          line-height: 100%;
      }

      .apple-link a {
          color: inherit !important;
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          text-decoration: none !important;
      }

      #MessageViewBody a {
          color: inherit;
          text-decoration: none;
          font-size: inherit;
          font-family: inherit;
          font-weight: inherit;
          line-height: inherit;
      }

      /*
     
     .btn-primary table td:hover {
          background-color: #34495e !important;
      }

      .btn-primary a:hover {
          background-color: #34495e !important;
          border-color: #34495e !important;
      } 
  
      */

      .body-container {
          display: flex;
          justify-content: center;
          flex-direction: column;
          align-items: center;
      }
  }
</style>
    `;

  return `<!doctype html>
    <html>

    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Beach Bookings</title>
        ${style}
    </head>
    
    <body>
        <span class="preheader">Hello there 👥</span>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
        <tr>
            <td>&nbsp;</td>
            <td class="container">
                <div class="content">

                    <!-- START CENTERED WHITE CONTAINER -->
                    <table role="presentation" class="main">

                        <!-- START MAIN CONTENT AREA -->
                        <tr>
                            <td class="wrapper">
                                <table role="presentation" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td>
                                            <div class="body-container">
                                                <img src="cid:beach-spike-small" alt="cig-frog-still" width="150px"
                                                    height="150px" />

                                                <div style="margin-top: 10px; padding-left: 15px;">
                                                    <h2 style="text-align: center; margin-bottom: 15px;">You've been
                                                        invited!</h2>
                                                        ${
                                                          inviterName ||
                                                          "A kind member"
                                                        } 
                                                    has invited you to join the group <b> ${
                                                      association.name
                                                    }</b>.
                                                </div>
                                            </div>
                                            <hr />

                                            <table role="presentation" cellpadding="0" cellspacing="0"
                                                class="btn btn-primary btn-lg">
                                                <tbody>
                                                    <tr style="display: flex; justify-content: center;">
                                                        <td>
                                                            <table role="presentation" cellpadding="0" cellspacing="0">
                                                                <tbody>
                                                                    <tr>
                                                                        <td>
                                                                            <a style="color: white !important;" href="${getEnvironmentSite()}/invite/${
    association.id
  }"
                                                                                target="_blank">Open invite</a>
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
                                </table>
                            </td>
                        </tr>

                        <!-- END MAIN CONTENT AREA -->
                    </table>
                    <!-- END CENTERED WHITE CONTAINER -->

                    <!-- START FOOTER -->
                    <div class="footer">

                    </div>
                    <!-- END FOOTER -->

                </div>
            </td>
            <td>&nbsp;</td>
        </tr>
    </table>
    </body>
    </html>`;
};