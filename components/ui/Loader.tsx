import React from 'react';

const Loader = () => {
  return (
    <>
      <style>{`
        .sb-loader {
          width: 112px;
          height: 112px;
          position: relative;
        }

        .sb-loader .box1,
        .sb-loader .box2,
        .sb-loader .box3 {
          border: 16px solid #d4af37;
          box-sizing: border-box;
          position: absolute;
          display: block;
        }

        .sb-loader .box1 {
          width: 112px;
          height: 48px;
          margin-top: 64px;
          margin-left: 0px;
          animation: sb-abox1 4s 1s forwards ease-in-out infinite;
        }

        .sb-loader .box2 {
          width: 48px;
          height: 48px;
          margin-top: 0px;
          margin-left: 0px;
          animation: sb-abox2 4s 1s forwards ease-in-out infinite;
        }

        .sb-loader .box3 {
          width: 48px;
          height: 48px;
          margin-top: 0px;
          margin-left: 64px;
          animation: sb-abox3 4s 1s forwards ease-in-out infinite;
        }

        @keyframes sb-abox1 {
          0%    { width: 112px; height: 48px;  margin-top: 64px; margin-left: 0px; }
          12.5% { width: 48px;  height: 48px;  margin-top: 64px; margin-left: 0px; }
          25%   { width: 48px;  height: 48px;  margin-top: 64px; margin-left: 0px; }
          37.5% { width: 48px;  height: 48px;  margin-top: 64px; margin-left: 0px; }
          50%   { width: 48px;  height: 48px;  margin-top: 64px; margin-left: 0px; }
          62.5% { width: 48px;  height: 48px;  margin-top: 64px; margin-left: 0px; }
          75%   { width: 48px;  height: 112px; margin-top: 0px;  margin-left: 0px; }
          87.5% { width: 48px;  height: 48px;  margin-top: 0px;  margin-left: 0px; }
          100%  { width: 48px;  height: 48px;  margin-top: 0px;  margin-left: 0px; }
        }

        @keyframes sb-abox2 {
          0%    { width: 48px;  height: 48px; margin-top: 0px; margin-left: 0px;  }
          12.5% { width: 48px;  height: 48px; margin-top: 0px; margin-left: 0px;  }
          25%   { width: 48px;  height: 48px; margin-top: 0px; margin-left: 0px;  }
          37.5% { width: 48px;  height: 48px; margin-top: 0px; margin-left: 0px;  }
          50%   { width: 112px; height: 48px; margin-top: 0px; margin-left: 0px;  }
          62.5% { width: 48px;  height: 48px; margin-top: 0px; margin-left: 64px; }
          75%   { width: 48px;  height: 48px; margin-top: 0px; margin-left: 64px; }
          87.5% { width: 48px;  height: 48px; margin-top: 0px; margin-left: 64px; }
          100%  { width: 48px;  height: 48px; margin-top: 0px; margin-left: 64px; }
        }

        @keyframes sb-abox3 {
          0%    { width: 48px;  height: 48px;  margin-top: 0px;  margin-left: 64px; }
          12.5% { width: 48px;  height: 48px;  margin-top: 0px;  margin-left: 64px; }
          25%   { width: 48px;  height: 112px; margin-top: 0px;  margin-left: 64px; }
          37.5% { width: 48px;  height: 48px;  margin-top: 64px; margin-left: 64px; }
          50%   { width: 48px;  height: 48px;  margin-top: 64px; margin-left: 64px; }
          62.5% { width: 48px;  height: 48px;  margin-top: 64px; margin-left: 64px; }
          75%   { width: 48px;  height: 48px;  margin-top: 64px; margin-left: 64px; }
          87.5% { width: 48px;  height: 48px;  margin-top: 64px; margin-left: 64px; }
          100%  { width: 112px; height: 48px;  margin-top: 64px; margin-left: 0px;  }
        }
      `}</style>
      <div className="sb-loader">
        <div className="box1" />
        <div className="box2" />
        <div className="box3" />
      </div>
    </>
  );
};

export default Loader;
