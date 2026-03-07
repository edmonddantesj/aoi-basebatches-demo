import{bY as j,d6 as n,dg as g,ds as o}from"./index-Dchf7W4r.js";import{m as $,l as a,o as d,c as h}from"./ethers-D1WT71Ay-CTxjtJ43.js";import{C as k}from"./getFormattedUsdFromLamports-B6EqSEho-C-HCdwKa.js";import{t as y}from"./transaction-CnfuREWo-nROljJQP.js";const O=({weiQuantities:e,tokenPrice:r,tokenSymbol:s})=>{let t=a(e),i=r?d(t,r):void 0,l=h(t,s);return n.jsx(c,{children:i||l})},P=({weiQuantities:e,tokenPrice:r,tokenSymbol:s})=>{let t=a(e),i=r?d(t,r):void 0,l=h(t,s);return n.jsx(c,{children:i?n.jsxs(n.Fragment,{children:[n.jsx(S,{children:"USD"}),i==="<$0.01"?n.jsxs(x,{children:[n.jsx(p,{children:"<"}),"$0.01"]}):i]}):l})},q=({quantities:e,tokenPrice:r,tokenSymbol:s="SOL",tokenDecimals:t=9})=>{let i=e.reduce(((u,f)=>u+f),0n),l=r&&s==="SOL"&&t===9?k(i,r):void 0,m=s==="SOL"&&t===9?y(i):`${j(i,t)} ${s}`;return n.jsx(c,{children:l?n.jsx(n.Fragment,{children:l==="<$0.01"?n.jsxs(x,{children:[n.jsx(p,{children:"<"}),"$0.01"]}):l}):m})};let c=o.span`
  font-size: 14px;
  line-height: 140%;
  display: flex;
  gap: 4px;
  align-items: center;
`,S=o.span`
  font-size: 12px;
  line-height: 12px;
  color: var(--privy-color-foreground-3);
`,p=o.span`
  font-size: 10px;
`,x=o.span`
  display: flex;
  align-items: center;
`;function v(e,r){return`https://explorer.solana.com/account/${e}?chain=${r}`}const D=e=>n.jsx(b,{href:e.chainType==="ethereum"?$(e.chainId,e.walletAddress):v(e.walletAddress,e.chainId),target:"_blank",children:g(e.walletAddress)});let b=o.a`
  &:hover {
    text-decoration: underline;
  }
`;export{q as f,P as h,O as p,D as v};
