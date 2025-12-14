// import FontPicker, { type FontToVariant } from "solid-fontpicker-ts"
// import { createSignal, Show } from "solid-js"
// import cs from "./App.module.css"
// import "solid-fontpicker-ts/style"

// export default function App() {
//   const [font1, setFont1] = createSignal("")
//   const [font2, setFont2] = createSignal("")
//   const [font3, setFont3] = createSignal("")
//   const [thinnestFont, setThinnestFont] = createSignal<FontToVariant>()
//   const [fontVariants, setFontVariants] = createSignal<FontToVariant>()
//   const [fontVariants3, setFontVariants3] = createSignal<FontToVariant>()
//   const [fontVariants4, setFontVariants4] = createSignal<FontToVariant>()
//   const [fontCategories, setFontCategories] = createSignal<string | string[]>("sans-serif")
//   const [manuallyLoadFonts1, setManuallyLoadFonts1] = createSignal("")
//   const [manuallyLoadFonts2, setManuallyLoadFonts2] = createSignal("")
//   const [manuallyAddFontValue, setManuallyAddFontValue] = createSignal("Tinos")
//   const [inputFont, setInputFont] = createSignal("")
//   const [outputFont, setOutputFont] = createSignal("")
//   const [checkLoadedFont, setCheckLoadedFont] = createSignal("")
//   const [fontToLoad, setFontToLoad] = createSignal<string | string[] | undefined>(undefined)
//   const [fontsLoaded, setFontsLoaded] = createSignal(false)
//   const [listboxFont, setListboxFont] = createSignal("")

//   return (
//     <>
//       <div id={cs.app}>
//         <h1>Google font picker for SolidJS</h1>
//         <p>This is a live demo showing how to use solid-fontpicker.</p>
//         <p>
//           See <a href="https://github.com/ae9is/react-fontpicker#readme">github repo</a> or{" "}
//           <a href="https://www.npmjs.com/package/solid-fontpicker-ts">npm package</a> for
//           installation instructions.
//         </p>
//         <div id={cs.toc}>
//           <h3>TOC</h3>
//           <ul>
//             <li>
//               <a href="#default">Default behaviour</a>
//             </li>
//             <li>
//               <a href="#fontvariants">Font variants</a>
//             </li>
//             <li>
//               <a href="#nomatches">No matches</a>
//             </li>
//             <li>
//               <a href="#autoload">Autoload fonts</a>
//             </li>
//             <li>
//               <a href="#manualload">Manually load fonts</a>
//             </li>
//             <li>
//               <a href="#loadallvariants">Load all variants</a>
//             </li>
//             <li>
//               <a href="#loadspecific">Load specific variants</a>
//             </li>
//             <li>
//               <a href="#loaderonly">Font loader only</a>
//             </li>
//             <li>
//               <a href="#choosegooglefonts">Choose Google fonts</a>
//             </li>
//             <li>
//               <a href="#filterlanguage">Filter by language</a>
//             </li>
//             <li>
//               <a href="#fontcategories">Filter font categories</a>
//             </li>
//             <li>
//               <a href="#manuallyadd">Manually add fonts</a>
//             </li>
//             <li>
//               <a href="#forms">Forms</a>
//             </li>
//             <li>
//               <a href="#controlled">Controlled values</a>
//             </li>
//             <li>
//               <a href="#checkloaded">Check font loading</a>
//             </li>
//             <li>
//               <a href="#listbox">List box mode</a>
//             </li>
//           </ul>
//         </div>
//         <h3 id="default">Default behaviour</h3>
//         <p>
//           By default the fontpicker is <strong>only</strong> a picker. The selected font is not
//           loaded. (Font previews are pre-built into the picker.)
//         </p>
//         <div class={cs.example}>
//           <FontPicker
//             defaultValue="Audiowide"
//             value={(val: string) => setFont1(val)}
//             data-testid="default-fontpicker"
//           />
//         </div>
//         <p data-testid="default-value">Current value: {font1()}</p>
//         <pre>
//           {"<FontPicker defaultValue={'Audiowide'} value={(font1: string) => setFont1(font1)} />"}
//         </pre>
//         <h3 id="fontvariants">Font variants</h3>
//         <p>
//           On mount and when a new font is selected the <code>fontVariants</code> callback is
//           triggered.
//         </p>
//         <div class={cs.example}>
//           <FontPicker
//             defaultValue="Mountains of Christmas"
//             fontVariants={(variants: FontToVariant) => {
//               setFontVariants(variants)
//             }}
//             data-testid="fontvariants-fontpicker"
//           />
//         </div>
//         <p>fontVariants:</p>
//         <pre data-testid="fontvariants-fontvariants">
//           {JSON.stringify(fontVariants() ?? "None", null, 2)}
//         </pre>
//         <pre>
//           {`<FontPicker
//   defaultValue="Mountains of Christmas"
//   fontVariants={(variants: FontToVariant) => {
//     setFontVariants(variants)
//   }}
// />
// <pre>{JSON.stringify(fontVariants() ?? 'None', null, 2)}</pre>
// `}
//         </pre>

//         <h3 id="nomatches">No matches</h3>
//         <p>
//           Customize the message when autocomplete yields no results using the <code>noMatches</code>{" "}
//           prop.
//         </p>
//         <div class={cs.example}>
//           <FontPicker noMatches="I've got nothing" data-testid="nomatches-fontpicker" />
//         </div>
//         <pre>{'<FontPicker noMatches="I\'ve got nothing" />'}</pre>

//         <h3 id="autoload">Autoload fonts</h3>
//         <p>
//           Automatically load fonts by setting the <code>autoLoad</code> prop.
//         </p>
//         <div class={cs.example}>
//           <FontPicker
//             autoLoad
//             defaultValue="Rock Salt"
//             value={(val: string) => setFont2(val)}
//             data-testid="autoload-fontpicker"
//           />
//         </div>
//         <p data-testid="autoload-value">
//           Current value: <span style={{ "font-family": font2() }}>{font2()}</span>
//         </p>
//         <pre>{`<FontPicker
//   autoLoad
//   defaultValue="Rock Salt"
//   value={(val) => setFont2(val)}
// />
// <p>Current value: <span style={{ 'font-family': font2() }}>{font2()}</span></p>`}</pre>

//         <h3 id="manualload">Manually load fonts</h3>
//         <div class={cs.example}>
//           <FontPicker loadFonts={manuallyLoadFonts1()} data-testid="manualload-fontpicker" />
//           <div class={cs.buttonGroup}>
//             <button
//               onClick={() => setManuallyLoadFonts1("Rubik Beastly")}
//               data-testid="manualload-beastly"
//             >
//               Load <span style={{ "font-family": "Rubik Beastly" }}>Rubik Beastly</span>
//             </button>
//             <button
//               onClick={() => setManuallyLoadFonts1("Pacifico, Teko")}
//               data-testid="manualload-pacifico-teko"
//             >
//               Load <span style={{ "font-family": "Pacifico" }}>Pacifico</span> and{" "}
//               <span style={{ "font-family": "Teko" }}>Teko</span>
//             </button>
//           </div>
//         </div>

//         <h3 id="loadallvariants">Load all variants</h3>
//         <div class={cs.example}>
//           <FontPicker
//             autoLoad
//             loadAllVariants
//             value={(val: string) => setFont3(val)}
//             fontVariants={(variants: FontToVariant) => {
//               setFontVariants3(variants)
//             }}
//             data-testid="loadallvariants-fontpicker"
//           />
//         </div>
//         <p data-testid="loadallvariants-value">
//           Current value: <span style={{ "font-family": font3() }}>{font3()}</span>
//         </p>
//         <p>Font variants:</p>
//         <pre data-testid="loadallvariants-fontvariants">
//           <Show when={fontVariants3()} keyed>
//             {(fv3: FontToVariant) =>
//               fv3.variants?.map((value: any, index: number) => {
//                 const fontFamily = fv3.fontName
//                 const [isItalic = "0", fontWeight = "400"] = value.toString().split(",")
//                 const fontStyle = isItalic === "1" ? "italic" : "normal"
//                 return (
//                   <div
//                     style={{
//                       "font-family": fontFamily,
//                       "font-weight": fontWeight,
//                       "font-style": fontStyle,
//                     }}
//                   >
//                     {fv3.fontName + " - " + (value ?? "None")}
//                   </div>
//                 )
//               })
//             }
//           </Show>
//         </pre>

//         <h3 id="loadspecific">Load specific variants</h3>
//         <div class={cs.example}>
//           <FontPicker
//             defaultValue="Orbitron"
//             loadFonts={thinnestFont() ? [thinnestFont()!] : undefined}
//             fontVariants={(v: FontToVariant) => {
//               setFontVariants4(v)
//               const thinnest: FontToVariant = {
//                 fontName: v.fontName,
//                 variants: v.variants.slice(0, 1),
//               }
//               setThinnestFont(thinnest)
//             }}
//             data-testid="loadspecific-fontpicker"
//           />
//         </div>
//         <p data-testid="loadspecific-value">
//           Current value:{" "}
//           <Show when={thinnestFont()} fallback="None" keyed>
//             {(tf: FontToVariant) => (
//               <span
//                 style={{
//                   "font-family": tf.fontName,
//                   "font-weight": tf.variants?.[0].toString().split(",")[1],
//                 }}
//               >
//                 {tf.fontName}
//               </span>
//             )}
//           </Show>
//         </p>

//         <h3 id="loaderonly">Font loader only</h3>
//         <div class={cs.example}>
//           <FontPicker
//             loadFonts={manuallyLoadFonts2()}
//             loaderOnly
//             data-testid="loaderonly-fontpicker"
//           />
//           <div class={cs.buttonGroup}>
//             <button onClick={() => setManuallyLoadFonts2("Rancho")} data-testid="loaderonly-rancho">
//               Load <span style={{ "font-family": "Rancho" }}>Rancho</span>
//             </button>
//             <button
//               onClick={() => setManuallyLoadFonts2("Smooch, Risque")}
//               data-testid="loaderonly-smooch-risque"
//             >
//               Load <span style={{ "font-family": "Smooch" }}>Smooch</span> and{" "}
//               <span style={{ "font-family": "Risque" }}>Risque</span>
//             </button>
//           </div>
//         </div>

//         <h3 id="choosegooglefonts">Choose Google fonts</h3>
//         <div class={cs.example}>
//           <FontPicker
//             googleFonts={["Tinos", "Open Sans"]}
//             data-testid="choosegooglefonts-fontpicker"
//           />
//         </div>

//         <h3 id="filterlanguage">Filter by language</h3>
//         <div class={cs.example}>
//           <FontPicker
//             googleFonts={(font) => !!font.subsets?.includes("chinese-simplified")}
//             data-testid="filterlanguage-fontpicker"
//           />
//         </div>

//         <h3 id="fontcategories">Filter font categories</h3>
//         <div class={cs.example}>
//           <select
//             value={fontCategories()}
//             onInput={(e) => setFontCategories(e.currentTarget.value)}
//             data-testid="fontcategories-select"
//           >
//             <option value="all">All</option>
//             <option value="serif">Serif</option>
//             <option value="sans-serif">Sans-serif</option>
//             <option value="display">Display</option>
//             <option value="handwriting">Handwriting</option>
//             <option value="monospace">Monospace</option>
//             <option value="display, serif">display, serif</option>
//           </select>
//           <FontPicker fontCategories={fontCategories()} data-testid="fontcategories-fontpicker" />
//         </div>

//         <h3 id="manuallyadd">Manually add fonts</h3>
//         <div class={cs.example}>
//           <FontPicker
//             autoLoad
//             value={(font: string) => setManuallyAddFontValue(font)}
//             googleFonts={["Tinos", "Open Sans"]}
//             localFonts={[
//               {
//                 name: "BickleyScript",
//                 sane: "bickleyscript",
//                 cased: "bickleyscript",
//                 category: "handwriting",
//                 variants: [
//                   {
//                     italic: false,
//                     weight: 400,
//                   },
//                   "1,400",
//                 ],
//               },
//             ]}
//             data-testid="manuallyadd-fontpicker"
//           />
//         </div>
//         <Show when={typeof manuallyAddFontValue() === "string"}>
//           <p data-testid="manuallyadd-value">
//             Current value:{" "}
//             <span
//               style={{
//                 "font-family": manuallyAddFontValue(),
//               }}
//             >
//               {manuallyAddFontValue()}
//             </span>
//           </p>
//         </Show>

//         <h3 id="forms">Forms</h3>
//         <form name="fontForm">
//           <label for="font">Font</label>
//           <div class={cs.example}>
//             <FontPicker
//               inputId="font"
//               defaultValue="Special Elite"
//               data-testid="forms-fontpicker"
//             />
//           </div>
//         </form>

//         <h3 id="controlled">Controlled values</h3>
//         <div class={cs.example}>
//           <FontPicker
//             defaultValue="Ubuntu"
//             value={(font: string) => setInputFont(font)}
//             data-testid="controlled-fontpicker-input"
//           />
//           <p data-testid="controlled-value-input">Input font value: {inputFont()}</p>
//           <FontPicker
//             defaultValue={inputFont()}
//             value={(font: string) => setOutputFont(font)}
//             data-testid="controlled-fontpicker-output"
//           />
//           <p data-testid="controlled-value-output">Output font value: {outputFont()}</p>
//         </div>

//         <h3 id="checkloaded">Check font loading</h3>
//         <div class={cs.example}>
//           <FontPicker
//             defaultValue="Unlock"
//             loadFonts={fontToLoad()}
//             value={(font: string) => setCheckLoadedFont(font)}
//             fontsLoaded={(loaded: boolean) => setFontsLoaded(loaded)}
//             data-testid="checkloaded-fontpicker"
//           />
//           <div class={cs.buttonGroup}>
//             <button
//               onClick={() => setFontToLoad(["Unkempt", "Annie Use Your Telescope"])}
//               data-testid="checkloaded-button"
//             >
//               Load <span style={{ "font-family": "Unkempt" }}>Unkempt</span>&nbsp; and{" "}
//               <span style={{ "font-family": "Annie Use Your Telescope" }}>
//                 Annie Use Your Telescope
//               </span>
//             </button>
//           </div>
//         </div>
//         <p data-testid="checkloaded-value">
//           Current font value:{" "}
//           <span style={{ "font-family": checkLoadedFont() }}>{checkLoadedFont()}</span>
//         </p>
//         <p data-testid="checkloaded-loaded">
//           No fonts currently loading:{" "}
//           <span style={{ "font-family": checkLoadedFont() }}>
//             {fontsLoaded() ? "true" : "false"}
//           </span>
//         </p>

//         <h3 id="listbox">List box mode</h3>
//         <div class={cs.example}>
//           <FontPicker
//             data-testid="listbox-fontpicker"
//             defaultValue="Tinos"
//             googleFonts={["Tinos", "Open Sans", "Orbitron", "Roboto"]}
//             value={(font: string) => setListboxFont(font)}
//             mode="list"
//           />
//         </div>
//         <p data-testid="listbox-value">Current value: {listboxFont()}</p>
//       </div>
//     </>
//   )
// }
