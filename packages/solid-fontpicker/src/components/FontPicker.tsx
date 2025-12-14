import {
  children,
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  lazy,
  mergeProps,
  Show,
  Suspense,
  splitProps,
} from "solid-js"
import fontInfos from "../../font-preview/fontInfo.json"
import { checkLoaded } from "../lib/fontChecker"
import { sanify } from "../lib/util"
import "./FontPicker.css"
import { isServer } from "solid-js/web"

const FontPreviews = lazy(() => import("./FontPreviews"))

export interface FontPickerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  noMatches?: string
  autoLoad?: boolean
  loaderOnly?: boolean
  loadAllVariants?: boolean
  loadFonts?: string[] | FontToVariant[] | string
  googleFonts?: string[] | Font[] | string | ((font: Font) => boolean)
  fontCategories?: string[] | string
  localFonts?: Font[] | undefined

  mode?: "combo" | "list"

  // For pairing with form labels
  inputId?: string

  // Callbacks to emit selected font
  fontVariants?: (fontVariants: FontToVariant) => void
  value?: (value: string) => void

  // To have the fontpicker poll and emit whether fonts have been loaded, if applicable
  fontsLoaded?: (fontsLoaded: boolean) => void
  fontsLoadedTimeout?: number // ms

  // Fallback component to display inside picker input while loading preview CSS
  loading?: JSX.Element
}

export interface Font {
  category: string
  name: string
  sane: string
  cased: string
  variants: Variant[]
  isLocal?: boolean
  subsets?: string[]
}

export interface FourFonts {
  regular?: number
  bold?: number
  italic?: number
  boldItalic?: number
}

export type Variant = FontVariant | string

export interface FontVariant {
  italic: boolean
  weight: number
}

export interface FontToVariant {
  fontName: string
  variants: Variant[]
}

// biome-ignore lint/suspicious/noShadowRestrictedNames: supressed
export function toString(v: Variant) {
  if (typeof v === "string") {
    return v
  }
  // biome-ignore lint/style/useTemplate: suppressed
  return (v.italic ? "1" : "0") + "," + v.weight
}

const defaultFont: Font = {
  category: "sans-serif",
  name: "Open Sans",
  sane: "open_sans",
  cased: "open sans",
  variants: [
    "0,300",
    "0,400",
    "0,500",
    "0,600",
    "0,700",
    "0,800",
    "1,300",
    "1,400",
    "1,500",
    "1,600",
    "1,700",
    "1,800",
  ],
}

export default function FontPicker(props: FontPickerProps) {
  const merged = mergeProps(
    {
      defaultValue: "Open Sans",
      noMatches: "No matches",
      autoLoad: false,
      loaderOnly: false,
      loadAllVariants: false,
      loadFonts: "",
      googleFonts: "all",
      fontCategories: "all",
      localFonts: [],
      mode: "combo",
      // loading: <div>Font previews loading ...</div>,
    },
    props
  )

  const [local, rest] = splitProps(merged, [
    "defaultValue",
    "noMatches",
    "autoLoad",
    "loaderOnly",
    "loadAllVariants",
    "loadFonts",
    "googleFonts",
    "fontCategories",
    "localFonts",
    "mode",
    "fontVariants",
    "value",
    "fontsLoaded",
    "fontsLoadedTimeout",
    "loading",
    "inputId",
    "class",
  ])

  const [focused, setFocused] = createSignal(false)
  const [selectedFontIndex, setSelectedFontIndex] = createSignal(-1)
  const [currentFontIndex, setCurrentFontIndex] = createSignal(-1)

  const prevLoadFontsRef = { current: [] as string[] }

  let inputRef: HTMLInputElement | undefined
  let popoutRef: HTMLDivElement | undefined
  let previewRef: HTMLDivElement | undefined
  const fontPickerOptionsRef = new Map<string, HTMLDivElement | null>()

  const allGoogleFonts = createMemo<Font[]>(() => {
    const ifonts: Font[] = []
    ;(fontInfos as Omit<Font, "cased">[]).forEach((info) => {
      const font: Font = { ...info, cased: info.name.toLowerCase() }
      ifonts.push(font)
    })
    return ifonts
  })

  const fonts = createMemo(() => {
    let activeFonts: Font[]
    const gf = local.googleFonts
    const all = allGoogleFonts()

    if (gf === "all") {
      activeFonts = [...all]
    } else if (typeof gf === "string") {
      const fontNames = gf
        .trim()
        .split(",")
        .map((v) => v.toLowerCase())
      activeFonts = [...all.filter((a: Font) => fontNames.includes(a.cased))]
    } else if (typeof gf === "function") {
      activeFonts = [...all.filter(gf)]
    } else {
      const fontNames =
        (gf as any[])?.map((v: any) => {
          if (typeof v === "string") {
            return v.toLowerCase()
          } else {
            return v.cased
          }
        }) ?? []
      activeFonts = [...all.filter((a: Font) => fontNames.includes(a.cased))]
    }

    if (local.localFonts) {
      local.localFonts.forEach((font: Font) => {
        activeFonts.push({
          category: font.category,
          name: font.name,
          cased: font.name.toLowerCase(),
          sane: sanify(font.name),
          variants: font.variants.map((v: Variant) => toString(v)),
          isLocal: true,
        })
      })
    }

    let activeFontsInCategory: Font[]
    const fc = local.fontCategories
    if (fc === "all") {
      activeFontsInCategory = [...activeFonts]
    } else if (typeof fc === "string") {
      const newFontCategories: string[] = fc
        .trim()
        .split(",")
        .map((v: string) => v.trim().toLowerCase())
      activeFontsInCategory = [
        ...activeFonts.filter((a: Font) => newFontCategories.includes(a.category)),
      ]
    } else {
      const newFontCategories = fc.map((v) => v.toLowerCase())
      activeFontsInCategory = [
        ...activeFonts.filter((a: Font) => newFontCategories.includes(a.category)),
      ]
    }
    return activeFontsInCategory
  })

  const getFontByName = (name: string) => {
    const list = fonts()
    return list.find((font) => font.name === name.trim()) || null
  }

  const saneDefaultValue = createMemo(() => {
    const search = local.defaultValue.toLowerCase().trim()
    const list = fonts()
    if (!list || list.length <= 0) {
      return local.defaultValue
    }
    if (list.some((a) => a.cased === search)) {
      return local.defaultValue
    }
    return list[0]!.name
  })

  const defaultCurrent = createMemo(() => getFontByName(saneDefaultValue()) || defaultFont)

  const [current, setCurrentState] = createSignal<Font>(defaultCurrent())

  createEffect(() => {
    setCurrentState(defaultCurrent())
  })

  const [typedSearch, setTypedSearch] = createSignal(saneDefaultValue())
  const [searchContent, setSearchContent] = createSignal(saneDefaultValue())

  const matchingFonts = createMemo(() => {
    const search = typedSearch().toLowerCase().trim()
    return fonts().filter((a) => a.cased.includes(search))
  })

  const getFourVariants = (variants: string[]) => {
    const regularWeights = variants
      .filter((v: string) => v.substring(0, 2) === "0,")
      .map((v: string) => Number.parseInt(v.substring(2)))
      .sort((a, b) => a - b)
    const italicWeights = variants
      .filter((v: string) => v.substring(0, 2) === "1,")
      .map((v: string) => Number.parseInt(v.substring(2)))
      .sort((a, b) => a - b)

    const fourFonts: FourFonts = {}

    fourFonts.regular = regularWeights.sort((a, b) => Math.abs(399 - a) - Math.abs(399 - b)).shift()
    fourFonts.bold = regularWeights
      .filter((v) => v > (fourFonts.regular || 0))
      .sort((a, b) => Math.abs(700 - a) - Math.abs(700 - b))
      .shift()

    fourFonts.italic = italicWeights.sort((a, b) => Math.abs(399 - a) - Math.abs(399 - b)).shift()
    fourFonts.boldItalic = italicWeights
      .filter((v) => v > (fourFonts.italic || 0))
      .sort((a, b) => Math.abs(700 - a) - Math.abs(700 - b))
      .shift()

    const fourVariants: string[] = []
    if (fourFonts.regular) fourVariants.push("0," + fourFonts.regular)
    if (fourFonts.bold) fourVariants.push("0," + fourFonts.bold)
    if (fourFonts.italic) fourVariants.push("1," + fourFonts.italic)
    if (fourFonts.boldItalic) fourVariants.push("1," + fourFonts.boldItalic)
    return fourVariants
  }

  const loadFontFromObject = (font: Font, variants: Variant[] = []) => {
    if (font?.isLocal) return

    let variantsToLoad = variants
    if (variantsToLoad?.length > 0) {
      variantsToLoad = font.variants.filter((v: Variant) => variantsToLoad.includes(v))
    } else if (local.loadAllVariants) {
      variantsToLoad = font.variants
    } else {
      variantsToLoad = getFourVariants(font.variants.map((v) => toString(v)))
    }

    let cssId = "google-font-" + font.sane
    const cssIdAll = cssId + "-all"
    if (variantsToLoad.length === font.variants.length) {
      cssId = cssIdAll
    } else {
      cssId += "-" + variantsToLoad.sort().join("-").replaceAll("1,", "i").replaceAll("0,", "")
    }

    const existing = document.getElementById(cssId)
    const existingAll = document.getElementById(cssIdAll)
    if (!existing && !existingAll && font?.name && variantsToLoad?.length > 0) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.id = cssId
      link.href =
        "https://fonts.googleapis.com/css2?family=" +
        font.name +
        ":ital,wght@" +
        variantsToLoad.sort().join(";") +
        "&display=swap"
      document.head.appendChild(link)
    }
  }

  const loadFontByName = (font: string | Font, variants: Variant[] = []) => {
    if (font === "") return
    let loaded: string | Font | null = font
    if (typeof font === "string") {
      loaded = getFontByName(font)
    }
    if (loaded === null || typeof loaded !== "object" || typeof loaded.sane !== "string") {
      console.error("Unknown font", font)
    } else if (loaded.variants.length < 1) {
      console.error("No valid variants of font", variants)
    } else {
      loadFontFromObject(loaded, variants)
    }
  }

  const handleLoadFont = () => {
    const lf = local.loadFonts
    if (typeof lf === "string") {
      if (lf !== "") {
        const fontNames = lf.trim().split(",")
        fontNames?.forEach((fontName: string) => {
          if (!prevLoadFontsRef.current.includes(fontName)) {
            prevLoadFontsRef.current.push(fontName)
            loadFontByName(fontName)
          }
        })
      }
    } else if (Array.isArray(lf)) {
      for (const font of lf) {
        const fontName = typeof font === "string" ? font : font?.fontName
        if (!fontName) continue
        if (!prevLoadFontsRef.current.includes(fontName)) {
          prevLoadFontsRef.current.push(fontName)
          if (typeof font === "object" && font.variants) {
            loadFontByName(
              fontName,
              font.variants.map((v) => toString(v))
            )
          } else {
            loadFontByName(fontName)
          }
        }
      }
    }
  }

  createEffect(() => {
    const _ = local.loadFonts
    handleLoadFont()
  })

  const loadFontsFontNames = createMemo(() => {
    const names: string[] = []
    const lf = local.loadFonts
    if (lf) {
      if (typeof lf === "string") {
        names.push(lf)
      } else if (Array.isArray(lf)) {
        for (const font of lf) {
          const fontName = typeof font === "string" ? font : font?.fontName
          if (fontName) names.push(fontName)
        }
      }
    }
    return names
  })

  createEffect(() => {
    if (local.autoLoad) {
      loadFontFromObject(current())
    }
  })

  createEffect(() => {
    const currentName = current().name
    const fontNamesToCheck = [...new Set([currentName, ...loadFontsFontNames()])]
    const timeout = local.fontsLoadedTimeout
    const cb = local.fontsLoaded

    if (cb) {
      ;(async () => {
        try {
          const promises = fontNamesToCheck.map(async (font) => {
            try {
              return await checkLoaded({
                fontFamily: font,
                timeout: timeout,
              })
            } catch (e) {
              return false
            }
          })
          const results = await Promise.all(promises)
          const allLoaded = !results.some((res) => !res)
          cb(allLoaded)
        } catch (e) {
          console.error(`Exception thrown checking if font families loaded`, e)
          cb(false)
        }
      })()
    }
  })

  const fontIndex = (font: Font) => {
    let idx: number
    if (local.mode === "list") {
      idx = fonts()?.findIndex((f) => f.name === font.name) ?? -1
    } else {
      idx = matchingFonts()?.findIndex((f) => f.name === font.name) ?? -1
    }
    if (idx < 0) idx = 0
    return idx
  }

  const emitFontVariants = (font: Font) => {
    if (font?.name && font?.variants) {
      local.fontVariants?.({
        fontName: font.name,
        variants: font.variants,
      })
    }
  }

  const emitValue = (font: Font) => {
    if (font?.name) {
      local.value?.(font.name)
    }
  }

  const setCurrent = (font: Font) => {
    setCurrentState(font)
    setTypedSearch(font.name)
    setSearchContent(font.name)
    inputRef?.blur()

    if (local.autoLoad) loadFontFromObject(font)

    emitFontVariants(font)
    emitValue(font)
    setCurrentFontIndex(fontIndex(font))
  }

  const showSelectedFont = (why = "key", index = selectedFontIndex()) => {
    const popout = popoutRef
    if (popout && index >= 0) {
      const selectedFont = matchingFonts()[index]
      if (selectedFont) {
        const optionNode = fontPickerOptionsRef.get(selectedFont.sane)
        if (optionNode) {
          const fontTop = optionNode.offsetTop
          const fontBottom = fontTop + optionNode.offsetHeight
          const popTop = popout.scrollTop
          const popBottom = popTop + popout.clientHeight

          if (why === "opening" || fontTop <= popTop) {
            popout.scrollTop = fontTop
            optionNode.classList.add("selected")
          } else if (fontBottom >= popBottom) {
            popout.scrollTop = fontBottom - popout.clientHeight - 1
          }

          const optionRef = fontPickerOptionsRef.get(selectedFont.sane)
          optionRef?.classList.add("selected")
        }
      }
    }
  }

  const show = () => {
    if (!focused()) {
      setFocused(true)
      setTimeout(() => {
        let newSelectedFontIndex = selectedFontIndex()
        const mFonts = matchingFonts()
        const currName = current().name

        for (let i = 0; i < mFonts.length; i++) {
          if (mFonts[i]?.name === currName) {
            newSelectedFontIndex = i
            setSelectedFontIndex(i)
            break
          }
        }
        setSearchContent(currName)
        showSelectedFont("opening", newSelectedFontIndex)
      }, 1)
    }
  }

  const hide = () => {
    inputRef?.blur()
    setFocused(false)
  }

  const cancelBlur = (e: MouseEvent) => {
    e.preventDefault()
  }

  const onFocus = () => {
    inputRef?.select()
    setTypedSearch("")
    show()
  }

  const searchChanged = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
    if (popoutRef?.scrollTop) {
      popoutRef.scrollTop = 0
    }
    const newValue = e.currentTarget.value
    setSelectedFontIndex(-1)
    const isLonger = typedSearch().length < newValue?.length
    setTypedSearch(newValue)

    if (!isLonger) {
      setSearchContent(newValue)
      return
    }

    const cased = newValue.toLowerCase()
    const matches = fonts().filter((a) => a.cased.startsWith(cased))
    if (matches?.length) {
      const firstMatch = matches[0]!.name
      e.currentTarget.value = firstMatch
      e.currentTarget.setSelectionRange(newValue.length, firstMatch.length)
      setSearchContent(firstMatch)
    } else {
      setSearchContent(newValue)
    }
  }

  const onKeyDown = (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => {
    if (e.key === "Enter") {
      const cased = searchContent().toLowerCase()
      const preciseMatches = fonts().filter((a) => a.cased === cased)
      if (selectedFontIndex() > -1) {
        setCurrent(matchingFonts()[selectedFontIndex()]!)
      } else if (preciseMatches.length === 1) {
        setCurrent(preciseMatches[0]!)
      } else if (matchingFonts().length > 0) {
        setCurrent(matchingFonts()[0]!)
      } else {
        setCurrent(current())
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      const mFonts = matchingFonts()
      if (selectedFontIndex() < mFonts.length - 1) {
        setSearchContent(typedSearch())
        const prev = selectedFontIndex()
        setSelectedFontIndex(prev + 1)
        showSelectedFont("key", prev + 1)
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (selectedFontIndex() > 0) {
        setSearchContent(typedSearch())
        const prev = selectedFontIndex()
        setSelectedFontIndex(prev - 1)
        showSelectedFont("key", prev - 1)
      }
    } else if (e.key === "Escape") {
      hide()
    }
  }

  const onKeyDownList = (e: KeyboardEvent & { currentTarget: HTMLDivElement }) => {
    if (e.key === "Enter") {
      if (selectedFontIndex() > -1) {
        setCurrent(fonts()[selectedFontIndex()]!)
      } else {
        setCurrent(current())
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (selectedFontIndex() < fonts().length - 1) {
        setSelectedFontIndex((prev) => prev + 1)
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (selectedFontIndex() > 0) {
        setSelectedFontIndex((prev) => prev - 1)
      }
    }
  }

  const outerClasses = () => {
    const cls = ["fontpicker"]
    if (local.class) cls.push(local.class)
    return cls.join(" ")
  }

  const popoutClasses = () => {
    const cls = ["fontpicker__popout"]
    if (focused()) cls.push("fontpicker__active")
    return cls.join(" ")
  }

  const previewClasses = () => {
    return `fontpicker__preview font-preview-${current().sane}`
  }

  const resolvedLoading = children(() => {
    if (isServer) return <>Font previews is loading...</> // Not showing properly, but fixes the weird issue on ssr

    return local.loading
    // return typeof local.loading === "function" ? local.loading() : local.loading
  })

  return (
    <Show when={!local.loaderOnly}>
      <div class={outerClasses()} {...rest}>
        <Suspense fallback={resolvedLoading()}>
          <FontPreviews />
          <Show
            when={local.mode === "list"}
            fallback={
              <>
                <div ref={(el) => (previewRef = el)} class={previewClasses()} />
                <input
                  id={local.inputId}
                  class="fontpicker__search"
                  ref={(el) => (inputRef = el)}
                  type="text"
                  onInput={searchChanged}
                  onFocus={onFocus}
                  onBlur={hide}
                  onKeyDown={onKeyDown}
                  value={searchContent()}
                />
                <div
                  ref={(el) => (popoutRef = el)}
                  tabIndex={-1}
                  class={popoutClasses()}
                  onMouseDown={cancelBlur}
                  role="listbox"
                >
                  <For each={matchingFonts()}>
                    {(font, i) => (
                      <div
                        ref={(el) => {
                          if (el) fontPickerOptionsRef.set(font.sane, el)
                          else fontPickerOptionsRef.delete(font.sane)
                        }}
                        class={
                          "fontpicker__option" +
                          (i() === selectedFontIndex() ? "selected" : "") +
                          (i() === currentFontIndex() ? "current" : "")
                        }
                        onMouseDown={() => {
                          setCurrent(font)
                          hide()
                        }}
                        onMouseMove={() => setSelectedFontIndex(i())}
                        role="option"
                      >
                        <div class={"font-preview-" + font.sane} />
                      </div>
                    )}
                  </For>
                  <Show when={matchingFonts().length === 0}>
                    <div class="fontpicker__nomatches">{local.noMatches}</div>
                  </Show>
                </div>
              </>
            }
          >
            <div class="fontpicker__listbox" role="listbox" tabIndex={0} onKeyDown={onKeyDownList}>
              <For each={fonts()}>
                {(font, i) => (
                  <div
                    ref={(el) => {
                      if (el) fontPickerOptionsRef.set(font.sane, el)
                      else fontPickerOptionsRef.delete(font.sane)
                    }}
                    class={
                      "fontpicker__option" +
                      (i() === selectedFontIndex() ? "selected" : "") +
                      (i() === currentFontIndex() ? "current" : "")
                    }
                    onMouseDown={() => {
                      setCurrent(font)
                      hide()
                    }}
                    onMouseMove={() => setSelectedFontIndex(i())}
                    role="option"
                  >
                    <div class={"font-preview-" + font.sane} />
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Suspense>
      </div>
    </Show>
  )
}
