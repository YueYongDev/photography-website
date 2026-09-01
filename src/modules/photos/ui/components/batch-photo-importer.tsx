"use client";

import Image from "next/image";
import imageCompression from "browser-image-compression";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleDashedIcon,
  FileImageIcon,
  FolderOpenIcon,
  ImagePlusIcon,
  LoaderCircleIcon,
  MapPinIcon,
  RotateCcwIcon,
  SparklesIcon,
  Trash2Icon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import {
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { IMAGE_SIZE_LIMIT } from "@/constants";
import { uploadPhoto } from "@/lib/photo-upload";
import {
  convertExifToFormData,
  getImageInfo,
  getPhotoExif,
  type TExifFormData,
  type TImageInfo,
} from "@/lib/utils";
import { useStudioLocale } from "@/modules/dashboard/i18n/studio-locale";
import { trpc } from "@/trpc/client";

import styles from "./batch-photo-importer.module.css";

const MAX_BATCH_SIZE = 50;
const IMPORT_CONCURRENCY = 2;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type QueueStatus =
  | "preparing"
  | "ready"
  | "compressing"
  | "uploading"
  | "saving"
  | "complete"
  | "error";

type ImportPhoto = {
  id: string;
  file: File;
  fingerprint: string;
  previewUrl: string;
  status: QueueStatus;
  progress: number;
  error?: string;
  uploadedUrl?: string;
  imageInfo?: TImageInfo;
  title: string;
  description: string;
  generatedTitle: boolean;
  generatedDescription: boolean;
  city: string;
  countryCode: string;
  dateTimeOriginal: string;
  make: string;
  model: string;
  lensModel: string;
  focalLength?: number;
  focalLength35mm?: number;
  fNumber?: number;
  iso?: number;
  exposureTime?: number;
  exposureCompensation?: number;
  latitude?: number;
  longitude?: number;
  gpsAltitude?: number;
};

type ImportCopy = ReturnType<typeof getImportCopy>;

const getImportCopy = (locale: "en" | "zh-CN") =>
  locale === "zh-CN"
    ? {
        steps: ["选择", "校对", "导入"],
        dropEyebrow: "批量照片整理",
        dropTitle: "把一组照片放进来",
        dropDescription:
          "先在本地读取尺寸、拍摄时间与相机信息；确认文案和地点后才会上传。",
        dropAction: "选择照片",
        folderAction: "选择文件夹",
        dropHint: "支持 JPG、PNG、WebP、AVIF 与 GIF；单张不超过 20 MB，一次最多 50 张",
        privacy: "所有照片导入后默认不精选，不会立即出现在公开作品页。",
        preparing: "正在整理照片",
        preparingHint: "读取预览、尺寸与 EXIF 信息…",
        reviewTitle: "导入前校对",
        reviewDescription:
          "左侧快速扫一遍整组照片，右侧修正当前照片。带提示的项目也可以稍后继续编辑。",
        all: "全部",
        needsReview: "待校对",
        selected: (count: number) => `已选 ${count} 张`,
        chooseAll: "全选",
        clear: "清除",
        bulkEdit: "批量设置",
        bulkHint: "以下内容只会应用到左侧勾选的照片。",
        city: "城市 / 地点",
        cityPlaceholder: "如 Hangzhou",
        country: "国家代码",
        countryPlaceholder: "如 CN",
        applyLocation: "应用地点",
        seriesName: "系列名称",
        seriesPlaceholder: "如 富春江暮色",
        startNumber: "起始序号",
        applySeries: "连续命名",
        sharedDescription: "统一描述初稿",
        descriptionPlaceholder: "先为这一组照片填入共同的背景，之后再逐张调整",
        applyDescription: "应用描述",
        noSelection: "请先勾选需要批量修改的照片",
        locationApplied: (count: number) => `已为 ${count} 张照片更新地点`,
        seriesApplied: (count: number) => `已为 ${count} 张照片连续命名`,
        descriptionApplied: (count: number) => `已为 ${count} 张照片更新描述`,
        photoCount: (count: number) => `${count} 张照片`,
        reviewCount: (count: number) => `${count} 条待校对`,
        ready: "信息齐全",
        suggestions: (count: number) => `${count} 条提示`,
        processing: "读取中",
        uploadComplete: "已导入",
        uploadFailed: "导入失败",
        remove: "移除照片",
        emptyFilter: "这组照片里没有待校对项目。",
        details: "照片信息",
        originalFile: "原始文件",
        title: "标题",
        titlePlaceholder: "为照片起一个便于识别的标题",
        description: "描述",
        date: "拍摄日期",
        location: "地点",
        camera: "相机与拍摄参数",
        cameraMake: "品牌",
        cameraModel: "型号",
        lens: "镜头",
        focalLength: "焦距 mm",
        aperture: "光圈",
        iso: "ISO",
        shutter: "快门（秒）",
        gpsRecorded: "已从照片读取 GPS 坐标",
        noGps: "照片中没有 GPS，可填写城市与国家代码",
        previous: "上一张",
        next: "下一张",
        addMore: "继续添加",
        cancel: "取消",
        startImport: (count: number) => `导入 ${count} 张照片`,
        retryImport: (count: number) => `重试 ${count} 张失败项目`,
        importAnywayTitle: "还有信息建议检查",
        importAnywayDescription: (count: number) =>
          `当前还有 ${count} 条校对提示。它们不会阻止导入，之后也可以在照片资料库逐张修改。`,
        backToReview: "继续校对",
        importAnyway: "仍然导入",
        importingTitle: "正在导入照片",
        importingDescription: "可以在这里查看每张照片的压缩、上传和保存进度。",
        imported: (done: number, total: number) => `已完成 ${done} / ${total}`,
        keepOpen: "导入过程中请保持此窗口开启",
        doneTitle: "这一组照片已整理入库",
        doneDescription: (count: number) =>
          `${count} 张照片已保存为未精选状态。现在可以回到资料库继续挑选作品。`,
        partialTitle: "部分照片还需要重试",
        partialDescription: (done: number, failed: number) =>
          `${done} 张已成功，${failed} 张失败。已上传成功的项目会从保存步骤继续。`,
        close: "完成",
        importAnother: "再导入一组",
        invalidFiles: (count: number) => `已忽略 ${count} 个不支持或超过 20 MB 的文件`,
        duplicateFiles: (count: number) => `已跳过 ${count} 个重复文件`,
        batchLimit: (count: number) => `一次最多导入 50 张，已保留前 ${count} 张`,
        genericTitle: "待命名照片",
        draftDescription: (title: string) => `${title}，一张等待进一步整理的摄影记录。`,
        issueTitle: "标题来自文件名，建议确认",
        issueDescription: "描述是自动填入的初稿",
        issueDate: "缺少拍摄日期",
        issueLocation: "缺少拍摄地点",
        issueImage: "无法读取图片尺寸",
        issueRequiredTitle: "标题不能为空",
        issueRequiredDescription: "描述不能为空",
        closeDuringImport: "照片正在导入，暂时不能关闭窗口。",
        discardConfirm: "关闭后会清空这次尚未导入的整理内容，确定关闭吗？",
        importSuccess: (count: number) => `已导入 ${count} 张照片`,
        importError: "部分照片导入失败，请检查后重试",
        unknownError: "导入失败，请重试",
      }
    : {
        steps: ["Select", "Review", "Import"],
        dropEyebrow: "Batch photo intake",
        dropTitle: "Bring in a complete shoot",
        dropDescription:
          "Dimensions, capture time and camera data are read locally. Nothing uploads until the captions and places are reviewed.",
        dropAction: "Choose photographs",
        folderAction: "Choose a folder",
        dropHint: "JPG, PNG, WebP, AVIF or GIF · 20 MB each · up to 50 at a time",
        privacy: "New photographs start unselected and do not immediately appear in public Work.",
        preparing: "Preparing photographs",
        preparingHint: "Reading previews, dimensions and EXIF data…",
        reviewTitle: "Review before import",
        reviewDescription:
          "Scan the shoot on the left and correct the active photograph on the right. Suggestions can also be resolved later.",
        all: "All",
        needsReview: "Needs review",
        selected: (count: number) => `${count} selected`,
        chooseAll: "Select all",
        clear: "Clear",
        bulkEdit: "Edit together",
        bulkHint: "Changes below apply only to checked photographs.",
        city: "City / place",
        cityPlaceholder: "e.g. Hangzhou",
        country: "Country code",
        countryPlaceholder: "e.g. CN",
        applyLocation: "Apply place",
        seriesName: "Series name",
        seriesPlaceholder: "e.g. Fuchun River dusk",
        startNumber: "Starts at",
        applySeries: "Number series",
        sharedDescription: "Shared description draft",
        descriptionPlaceholder: "Add the shared context now, then refine each frame",
        applyDescription: "Apply description",
        noSelection: "Select the photographs you want to edit together first",
        locationApplied: (count: number) => `Place updated on ${count} photographs`,
        seriesApplied: (count: number) => `${count} photographs numbered`,
        descriptionApplied: (count: number) => `Description updated on ${count} photographs`,
        photoCount: (count: number) => `${count} photographs`,
        reviewCount: (count: number) => `${count} review notes`,
        ready: "Ready",
        suggestions: (count: number) => `${count} notes`,
        processing: "Reading",
        uploadComplete: "Imported",
        uploadFailed: "Import failed",
        remove: "Remove photograph",
        emptyFilter: "Nothing in this shoot currently needs review.",
        details: "Photograph details",
        originalFile: "Original file",
        title: "Title",
        titlePlaceholder: "Give this photograph a recognizable title",
        description: "Description",
        date: "Date taken",
        location: "Place",
        camera: "Camera & exposure",
        cameraMake: "Make",
        cameraModel: "Model",
        lens: "Lens",
        focalLength: "Focal length mm",
        aperture: "Aperture",
        iso: "ISO",
        shutter: "Shutter (seconds)",
        gpsRecorded: "GPS coordinates were read from this photograph",
        noGps: "No GPS found; add a city and country code if known",
        previous: "Previous",
        next: "Next",
        addMore: "Add more",
        cancel: "Cancel",
        startImport: (count: number) => `Import ${count} photographs`,
        retryImport: (count: number) => `Retry ${count} failed`,
        importAnywayTitle: "Some details still need a look",
        importAnywayDescription: (count: number) =>
          `${count} review notes remain. They do not block import and can also be resolved from the library later.`,
        backToReview: "Keep reviewing",
        importAnyway: "Import anyway",
        importingTitle: "Importing photographs",
        importingDescription: "Compression, upload and save progress is shown for every frame.",
        imported: (done: number, total: number) => `${done} of ${total} complete`,
        keepOpen: "Keep this window open while the import is running",
        doneTitle: "This shoot is in the library",
        doneDescription: (count: number) =>
          `${count} photographs were saved as unselected. Return to the library when you are ready to curate Work.`,
        partialTitle: "A few photographs need another try",
        partialDescription: (done: number, failed: number) =>
          `${done} succeeded and ${failed} failed. Uploaded files resume from the save step.`,
        close: "Done",
        importAnother: "Import another shoot",
        invalidFiles: (count: number) => `${count} unsupported or oversized files ignored`,
        duplicateFiles: (count: number) => `${count} duplicate files skipped`,
        batchLimit: (count: number) => `The batch is limited to 50; the first ${count} were kept`,
        genericTitle: "Untitled photograph",
        draftDescription: (title: string) => `${title}, a photographic note ready for further detail.`,
        issueTitle: "Title came from the filename",
        issueDescription: "Description is an automatic starter",
        issueDate: "Capture date missing",
        issueLocation: "Place missing",
        issueImage: "Image dimensions could not be read",
        issueRequiredTitle: "Title is required",
        issueRequiredDescription: "Description is required",
        closeDuringImport: "Photographs are still importing, so this window must stay open.",
        discardConfirm: "Close and discard the review work for photographs that have not been imported?",
        importSuccess: (count: number) => `${count} photographs imported`,
        importError: "Some photographs failed to import. Review them and try again.",
        unknownError: "Import failed. Please try again.",
      };

const fingerprintFile = (file: File) =>
  `${file.name}:${file.size}:${file.lastModified}:${file.type}`;

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

const titleFromFilename = (filename: string, fallback: string) => {
  const raw = filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const cameraFilename = /^(?:img|dscf?|dji|pxl|mvimg|r\d|l\d)\s*\d+$/i;

  if (!raw || cameraFilename.test(raw)) return fallback;

  return raw
    .split(" ")
    .map((word) =>
      /^[a-z]/.test(word) ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : word,
    )
    .join(" ");
};

const coordinateFromExif = (value?: string) => {
  if (!value) return undefined;
  const coordinate = Number.parseFloat(value);
  return Number.isFinite(coordinate) ? coordinate : undefined;
};

const dateTimeForInput = (value: unknown) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  if (!Number.isFinite(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
};

const numericValue = (value: string) => {
  if (value.trim() === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

const getReviewIssues = (photo: ImportPhoto, copy: ImportCopy) => {
  const issues: string[] = [];
  if (!photo.imageInfo || photo.imageInfo.width === 0) issues.push(copy.issueImage);
  if (!photo.title.trim()) issues.push(copy.issueRequiredTitle);
  else if (photo.generatedTitle) issues.push(copy.issueTitle);
  if (!photo.description.trim()) issues.push(copy.issueRequiredDescription);
  else if (photo.generatedDescription) issues.push(copy.issueDescription);
  if (!photo.dateTimeOriginal) issues.push(copy.issueDate);
  if (!photo.city.trim() && photo.latitude === undefined) issues.push(copy.issueLocation);
  return issues;
};

const isImportable = (photo: ImportPhoto) =>
  Boolean(
    photo.imageInfo?.width &&
      photo.imageInfo.height &&
      photo.title.trim() &&
      photo.description.trim(),
  );

export function BatchPhotoImporter({
  onRequestClose,
  onImportSuccess,
  closeRequestSignal = 0,
}: {
  onRequestClose: () => void;
  onImportSuccess?: () => void;
  closeRequestSignal?: number;
}) {
  const { locale } = useStudioLocale();
  const copy = useMemo(() => getImportCopy(locale), [locale]);
  const utils = trpc.useUtils();
  const createUpload = trpc.storage.createPhotoUpload.useMutation();
  const createPhoto = trpc.photos.create.useMutation();
  const [queue, setQueue] = useState<ImportPhoto[]>([]);
  const queueRef = useRef(queue);
  const previewUrlsRef = useRef(new Set<string>());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [needsReviewOnly, setNeedsReviewOnly] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCity, setBulkCity] = useState("");
  const [bulkCountry, setBulkCountry] = useState("");
  const [seriesName, setSeriesName] = useState("");
  const [seriesStart, setSeriesStart] = useState("1");
  const [sharedDescription, setSharedDescription] = useState("");
  const [showImportWarning, setShowImportWarning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const handledCloseRequestRef = useRef(closeRequestSignal);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const syncQueue = useCallback(
    (updater: (current: ImportPhoto[]) => ImportPhoto[]) => {
      setQueue((current) => {
        const next = updater(current);
        queueRef.current = next;
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    const folderInput = folderInputRef.current;
    folderInput?.setAttribute("webkitdirectory", "");
    folderInput?.setAttribute("directory", "");
  }, []);

  useEffect(
    () => () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    },
    [],
  );

  const prepareFile = useCallback(
    async (photo: ImportPhoto) => {
      try {
        const [rawExif, imageInfo] = await Promise.all([
          getPhotoExif(photo.file),
          getImageInfo(photo.file),
        ]);
        const exif: TExifFormData = convertExifToFormData(rawExif);
        const generatedTitle = titleFromFilename(photo.file.name, copy.genericTitle);

        syncQueue((current) =>
          current.map((item) =>
            item.id === photo.id
              ? {
                  ...item,
                  status: "ready",
                  progress: 0,
                  imageInfo,
                  title: generatedTitle,
                  description: copy.draftDescription(generatedTitle),
                  generatedTitle: true,
                  generatedDescription: true,
                  dateTimeOriginal: dateTimeForInput(exif.dateTimeOriginal),
                  make: exif.make ?? "",
                  model: exif.model ?? "",
                  lensModel: exif.lensModel ?? "",
                  focalLength: exif.focalLength,
                  focalLength35mm: exif.focalLength35mm,
                  fNumber: exif.fNumber,
                  iso: exif.iso,
                  exposureTime: exif.exposureTime,
                  exposureCompensation: exif.exposureCompensation,
                  latitude: coordinateFromExif(exif.latitude),
                  longitude: coordinateFromExif(exif.longitude),
                  gpsAltitude: exif.gpsAltitude,
                }
              : item,
          ),
        );
      } catch (error) {
        syncQueue((current) =>
          current.map((item) =>
            item.id === photo.id
              ? {
                  ...item,
                  status: "error",
                  error: error instanceof Error ? error.message : copy.unknownError,
                }
              : item,
          ),
        );
      }
    },
    [copy, syncQueue],
  );

  const addFiles = useCallback(
    async (fileList: File[] | FileList) => {
      const incoming = Array.from(fileList);
      const valid = incoming.filter(
        (file) => ACCEPTED_IMAGE_TYPES.has(file.type) && file.size <= IMAGE_SIZE_LIMIT,
      );
      const invalidCount = incoming.length - valid.length;
      if (invalidCount) toast.error(copy.invalidFiles(invalidCount));

      const existing = new Set(queueRef.current.map((photo) => photo.fingerprint));
      const unique: File[] = [];
      let duplicateCount = 0;
      valid.forEach((file) => {
        const fingerprint = fingerprintFile(file);
        if (existing.has(fingerprint)) {
          duplicateCount += 1;
          return;
        }
        existing.add(fingerprint);
        unique.push(file);
      });
      if (duplicateCount) toast(copy.duplicateFiles(duplicateCount));

      const available = Math.max(0, MAX_BATCH_SIZE - queueRef.current.length);
      const accepted = unique.slice(0, available);
      if (unique.length > available) toast.error(copy.batchLimit(MAX_BATCH_SIZE));
      if (!accepted.length) return;

      const additions = accepted.map<ImportPhoto>((file) => {
        const previewUrl = URL.createObjectURL(file);
        previewUrlsRef.current.add(previewUrl);
        return {
          id: crypto.randomUUID(),
          file,
          fingerprint: fingerprintFile(file),
          previewUrl,
          status: "preparing",
          progress: 0,
          title: "",
          description: "",
          generatedTitle: true,
          generatedDescription: true,
          city: "",
          countryCode: "",
          dateTimeOriginal: "",
          make: "",
          model: "",
          lensModel: "",
        };
      });

      syncQueue((current) => [...current, ...additions]);
      setSelectedIds((current) => {
        const next = new Set(current);
        additions.forEach((photo) => next.add(photo.id));
        return next;
      });
      setActiveId((current) => current ?? additions[0]?.id ?? null);
      await Promise.all(additions.map(prepareFile));
    },
    [copy, prepareFile, syncQueue],
  );

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) void addFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length) void addFiles(event.dataTransfer.files);
  };

  const updatePhoto = useCallback(
    (id: string, changes: Partial<ImportPhoto>) => {
      syncQueue((current) =>
        current.map((photo) => (photo.id === id ? { ...photo, ...changes } : photo)),
      );
      setShowImportWarning(false);
    },
    [syncQueue],
  );

  const removePhoto = (id: string) => {
    const index = queueRef.current.findIndex((photo) => photo.id === id);
    const target = queueRef.current[index];
    if (!target || isImporting || target.status === "complete") return;
    URL.revokeObjectURL(target.previewUrl);
    previewUrlsRef.current.delete(target.previewUrl);
    const next = queueRef.current.filter((photo) => photo.id !== id);
    syncQueue(() => next);
    setSelectedIds((current) => {
      const selection = new Set(current);
      selection.delete(id);
      return selection;
    });
    if (activeId === id) setActiveId(next[index]?.id ?? next[index - 1]?.id ?? null);
  };

  const resetImporter = () => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current.clear();
    queueRef.current = [];
    setQueue([]);
    setActiveId(null);
    setSelectedIds(new Set());
    setNeedsReviewOnly(false);
    setBulkOpen(false);
    setShowImportWarning(false);
    setIsImporting(false);
  };

  const requestClose = () => {
    if (isImporting) {
      toast.error(copy.closeDuringImport);
      return;
    }
    const hasUnfinished = queue.some((photo) => photo.status !== "complete");
    if (hasUnfinished && !window.confirm(copy.discardConfirm)) return;
    resetImporter();
    onRequestClose();
  };

  useEffect(() => {
    if (handledCloseRequestRef.current === closeRequestSignal) return;
    handledCloseRequestRef.current = closeRequestSignal;
    requestClose();
    // The signal deliberately represents a single external close attempt. The
    // latest queue and progress state are read from this render before acting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeRequestSignal]);

  const selectedPhotos = queue.filter((photo) => selectedIds.has(photo.id));
  const readyPhotos = queue.filter(
    (photo) => photo.status === "ready" || photo.status === "error",
  );
  const reviewNoteCount = readyPhotos.reduce(
    (total, photo) => total + getReviewIssues(photo, copy).length,
    0,
  );
  const invalidPhotos = readyPhotos.filter((photo) => !isImportable(photo));
  const preparingCount = queue.filter((photo) => photo.status === "preparing").length;
  const completedCount = queue.filter((photo) => photo.status === "complete").length;
  const failedCount = queue.filter((photo) => photo.status === "error").length;
  const isFinished = queue.length > 0 && completedCount + failedCount === queue.length;
  const isFullyComplete = queue.length > 0 && completedCount === queue.length;

  const filteredQueue = queue.filter((photo) =>
    needsReviewOnly ? getReviewIssues(photo, copy).length > 0 : true,
  );
  const activePhoto =
    queue.find((photo) => photo.id === activeId) ?? filteredQueue[0] ?? null;
  const activeIndex = activePhoto
    ? filteredQueue.findIndex((photo) => photo.id === activePhoto.id)
    : -1;

  useEffect(() => {
    if (!filteredQueue.length) return;
    if (!activePhoto || !filteredQueue.some((photo) => photo.id === activePhoto.id)) {
      setActiveId(filteredQueue[0].id);
    }
  }, [activePhoto, filteredQueue]);

  const requireSelection = () => {
    if (selectedPhotos.length) return true;
    toast.error(copy.noSelection);
    return false;
  };

  const applyLocation = () => {
    if (!requireSelection()) return;
    const city = bulkCity.trim();
    const countryCode = bulkCountry.trim().toUpperCase().slice(0, 2);
    syncQueue((current) =>
      current.map((photo) =>
        selectedIds.has(photo.id)
          ? {
              ...photo,
              ...(city ? { city } : {}),
              ...(countryCode ? { countryCode } : {}),
            }
          : photo,
      ),
    );
    setShowImportWarning(false);
    toast.success(copy.locationApplied(selectedPhotos.length));
  };

  const applySeriesNames = () => {
    if (!requireSelection() || !seriesName.trim()) return;
    const start = Math.max(0, Number.parseInt(seriesStart, 10) || 1);
    let offset = 0;
    syncQueue((current) =>
      current.map((photo) => {
        if (!selectedIds.has(photo.id)) return photo;
        const number = String(start + offset).padStart(2, "0");
        offset += 1;
        return {
          ...photo,
          title: `${seriesName.trim()} ${number}`,
          generatedTitle: false,
        };
      }),
    );
    setShowImportWarning(false);
    toast.success(copy.seriesApplied(selectedPhotos.length));
  };

  const applySharedDescription = () => {
    if (!requireSelection() || !sharedDescription.trim()) return;
    syncQueue((current) =>
      current.map((photo) =>
        selectedIds.has(photo.id)
          ? {
              ...photo,
              description: sharedDescription.trim(),
              generatedDescription: false,
            }
          : photo,
      ),
    );
    setShowImportWarning(false);
    toast.success(copy.descriptionApplied(selectedPhotos.length));
  };

  const invalidateLibrary = async () => {
    await Promise.all([
      utils.photos.getMany.invalidate(),
      utils.photos.getManyWithPrivate.invalidate(),
      utils.photos.getStudioStats.invalidate(),
      utils.photos.getSelectedPhotos.invalidate(),
      utils.summary.getSummary.invalidate(),
    ]);
  };

  const importOne = async (id: string) => {
    const getCurrent = () => queueRef.current.find((photo) => photo.id === id);
    const initial = getCurrent();
    if (!initial?.imageInfo || !isImportable(initial)) return;

    try {
      let publicUrl = initial.uploadedUrl;
      if (!publicUrl) {
        updatePhoto(id, { status: "compressing", progress: 2, error: undefined });
        const compressedFile = await imageCompression(initial.file, {
          maxSizeMB: 1.8,
          maxWidthOrHeight: 2560,
          useWebWorker: true,
        });
        updatePhoto(id, { status: "uploading", progress: 8 });
        const ticket = await createUpload.mutateAsync({
          contentType: compressedFile.type,
        });
        await uploadPhoto({
          file: compressedFile,
          key: ticket.key,
          token: ticket.token,
          onProgress: (progress) =>
            updatePhoto(id, {
              status: "uploading",
              progress: Math.max(8, Math.round(8 + progress * 0.78)),
            }),
        });
        publicUrl = ticket.publicUrl;
        updatePhoto(id, { uploadedUrl: publicUrl, status: "saving", progress: 90 });
      } else {
        updatePhoto(id, { status: "saving", progress: 90, error: undefined });
      }

      const photo = getCurrent();
      if (!photo?.imageInfo || !publicUrl) throw new Error(copy.unknownError);
      await createPhoto.mutateAsync({
        url: publicUrl,
        title: photo.title.trim(),
        description: photo.description.trim(),
        isFavorite: false,
        visibility: "private",
        aspectRatio: photo.imageInfo.aspectRatio,
        width: photo.imageInfo.width,
        height: photo.imageInfo.height,
        blurData: photo.imageInfo.blurhash,
        city: photo.city.trim() || undefined,
        countryCode: photo.countryCode.trim().toUpperCase() || undefined,
        make: photo.make.trim() || undefined,
        model: photo.model.trim() || undefined,
        lensModel: photo.lensModel.trim() || undefined,
        focalLength: photo.focalLength,
        focalLength35mm: photo.focalLength35mm,
        fNumber: photo.fNumber,
        iso: photo.iso,
        exposureTime: photo.exposureTime,
        exposureCompensation: photo.exposureCompensation,
        latitude: photo.latitude,
        longitude: photo.longitude,
        gpsAltitude: photo.gpsAltitude,
        dateTimeOriginal: photo.dateTimeOriginal || undefined,
      });
      updatePhoto(id, { status: "complete", progress: 100, error: undefined });
    } catch (error) {
      updatePhoto(id, {
        status: "error",
        error: error instanceof Error ? error.message : copy.unknownError,
      });
    }
  };

  const runImport = async (skipWarning = false) => {
    const pending = queueRef.current.filter((photo) => photo.status !== "complete");
    const notImportable = pending.filter((photo) => !isImportable(photo));
    if (preparingCount || notImportable.length) {
      setNeedsReviewOnly(true);
      const firstInvalid = notImportable[0];
      if (firstInvalid) setActiveId(firstInvalid.id);
      return;
    }
    const remainingNotes = pending.reduce(
      (total, photo) => total + getReviewIssues(photo, copy).length,
      0,
    );
    if (remainingNotes > 0 && !skipWarning) {
      setShowImportWarning(true);
      return;
    }

    setShowImportWarning(false);
    setIsImporting(true);
    let cursor = 0;
    const ids = pending.map((photo) => photo.id);
    const worker = async () => {
      while (cursor < ids.length) {
        const id = ids[cursor];
        cursor += 1;
        await importOne(id);
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(IMPORT_CONCURRENCY, ids.length) }, worker),
    );
    setIsImporting(false);
    await invalidateLibrary();

    const successful = queueRef.current.filter(
      (photo) => photo.status === "complete",
    ).length;
    const failed = queueRef.current.filter((photo) => photo.status === "error").length;
    if (successful) {
      toast.success(copy.importSuccess(successful));
      onImportSuccess?.();
    }
    if (failed) toast.error(copy.importError);
  };

  const overallProgress = queue.length
    ? Math.round(queue.reduce((total, photo) => total + photo.progress, 0) / queue.length)
    : 0;

  if (queue.length === 0) {
    return (
      <div className={styles.importer}>
        <StepRail current={0} labels={copy.steps} />
        <div
          className={styles.dropStage}
          data-dragging={isDragging || undefined}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (event.currentTarget === event.target) setIsDragging(false);
          }}
          onDrop={handleDrop}
        >
          <div className={styles.dropArtwork} aria-hidden="true">
            <span><FileImageIcon size={28} /></span>
            <span><FileImageIcon size={28} /></span>
            <span><ImagePlusIcon size={30} /></span>
          </div>
          <p className={styles.dropEyebrow}>{copy.dropEyebrow}</p>
          <h2>{copy.dropTitle}</h2>
          <p className={styles.dropDescription}>{copy.dropDescription}</p>
          <div className={styles.dropActions}>
            <button type="button" className={styles.primaryButton} onClick={() => fileInputRef.current?.click()}>
              <ImagePlusIcon size={15} />
              {copy.dropAction}
            </button>
            <button type="button" className={styles.secondaryButton} onClick={() => folderInputRef.current?.click()}>
              <FolderOpenIcon size={15} />
              {copy.folderAction}
            </button>
          </div>
          <p className={styles.dropHint}>{copy.dropHint}</p>
          <div className={styles.privacyNote}>
            <CheckCircle2Icon size={15} />
            <span>{copy.privacy}</span>
          </div>
        </div>
        <HiddenFileInputs fileInputRef={fileInputRef} folderInputRef={folderInputRef} onChange={handleFiles} />
      </div>
    );
  }

  if (isFullyComplete || (isFinished && failedCount > 0)) {
    return (
      <div className={styles.importer}>
        <StepRail current={2} labels={copy.steps} />
        <div className={styles.completionStage}>
          <div className={styles.completionMark} data-partial={failedCount > 0 || undefined}>
            {failedCount > 0 ? <AlertCircleIcon size={34} /> : <CheckIcon size={34} />}
          </div>
          <p className={styles.dropEyebrow}>03 / {copy.steps[2]}</p>
          <h2>{failedCount > 0 ? copy.partialTitle : copy.doneTitle}</h2>
          <p>
            {failedCount > 0
              ? copy.partialDescription(completedCount, failedCount)
              : copy.doneDescription(completedCount)}
          </p>
          <div className={styles.completionStats}>
            <span><strong>{completedCount}</strong>{copy.uploadComplete}</span>
            {failedCount > 0 ? <span data-error><strong>{failedCount}</strong>{copy.uploadFailed}</span> : null}
          </div>
          <div className={styles.dropActions}>
            {failedCount > 0 ? (
              <button type="button" className={styles.primaryButton} onClick={() => void runImport(true)}>
                <RotateCcwIcon size={15} />
                {copy.retryImport(failedCount)}
              </button>
            ) : (
              <button type="button" className={styles.primaryButton} onClick={requestClose}>
                <CheckIcon size={15} />
                {copy.close}
              </button>
            )}
            <button type="button" className={styles.secondaryButton} onClick={resetImporter} disabled={failedCount > 0}>
              <ImagePlusIcon size={15} />
              {copy.importAnother}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.importer}>
      <StepRail current={isImporting ? 2 : 1} labels={copy.steps} />

      <header className={styles.reviewHeader}>
        <div>
          <p className={styles.dropEyebrow}>{isImporting ? `03 / ${copy.steps[2]}` : `02 / ${copy.steps[1]}`}</p>
          <h2>{isImporting ? copy.importingTitle : copy.reviewTitle}</h2>
          <p>{isImporting ? copy.importingDescription : copy.reviewDescription}</p>
        </div>
        <div className={styles.reviewSummary}>
          <span>{copy.photoCount(queue.length)}</span>
          <span data-alert={reviewNoteCount > 0 || undefined}>{copy.reviewCount(reviewNoteCount)}</span>
        </div>
      </header>

      {preparingCount > 0 ? (
        <div className={styles.preparingBar} role="status">
          <LoaderCircleIcon size={15} />
          <span><strong>{copy.preparing}</strong>{copy.preparingHint}</span>
          <em>{queue.length - preparingCount}/{queue.length}</em>
        </div>
      ) : null}

      {!isImporting ? (
        <div className={styles.reviewToolbar}>
          <div className={styles.filterTabs}>
            <button type="button" data-active={!needsReviewOnly || undefined} onClick={() => setNeedsReviewOnly(false)}>
              {copy.all}<span>{queue.length}</span>
            </button>
            <button type="button" data-active={needsReviewOnly || undefined} onClick={() => setNeedsReviewOnly(true)}>
              {copy.needsReview}<span>{readyPhotos.filter((photo) => getReviewIssues(photo, copy).length > 0).length}</span>
            </button>
          </div>
          <div className={styles.toolbarActions}>
            <span>{copy.selected(selectedIds.size)}</span>
            <button type="button" onClick={() => setSelectedIds(new Set(queue.map((photo) => photo.id)))}>{copy.chooseAll}</button>
            <button type="button" onClick={() => setSelectedIds(new Set())}>{copy.clear}</button>
            <button type="button" className={styles.bulkButton} data-active={bulkOpen || undefined} onClick={() => setBulkOpen((open) => !open)}>
              <SparklesIcon size={14} />{copy.bulkEdit}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.importProgress}>
          <div><span>{copy.imported(completedCount, queue.length)}</span><strong>{overallProgress}%</strong></div>
          <div className={styles.progressTrack}><span style={{ width: `${overallProgress}%` }} /></div>
          <p>{copy.keepOpen}</p>
        </div>
      )}

      {bulkOpen && !isImporting ? (
        <section className={styles.bulkPanel}>
          <header><div><strong>{copy.bulkEdit}</strong><span>{copy.bulkHint}</span></div><button type="button" onClick={() => setBulkOpen(false)} aria-label={copy.close}><XIcon size={15} /></button></header>
          <div className={styles.bulkGrid}>
            <div className={styles.bulkGroup}>
              <label><span>{copy.city}</span><input value={bulkCity} onChange={(event) => setBulkCity(event.target.value)} placeholder={copy.cityPlaceholder} /></label>
              <label className={styles.countryField}><span>{copy.country}</span><input value={bulkCountry} maxLength={2} onChange={(event) => setBulkCountry(event.target.value.toUpperCase())} placeholder={copy.countryPlaceholder} /></label>
              <button type="button" onClick={applyLocation}>{copy.applyLocation}</button>
            </div>
            <div className={styles.bulkGroup}>
              <label><span>{copy.seriesName}</span><input value={seriesName} onChange={(event) => setSeriesName(event.target.value)} placeholder={copy.seriesPlaceholder} /></label>
              <label className={styles.numberField}><span>{copy.startNumber}</span><input type="number" min="0" value={seriesStart} onChange={(event) => setSeriesStart(event.target.value)} /></label>
              <button type="button" onClick={applySeriesNames}>{copy.applySeries}</button>
            </div>
            <div className={`${styles.bulkGroup} ${styles.descriptionGroup}`}>
              <label><span>{copy.sharedDescription}</span><input value={sharedDescription} onChange={(event) => setSharedDescription(event.target.value)} placeholder={copy.descriptionPlaceholder} /></label>
              <button type="button" onClick={applySharedDescription}>{copy.applyDescription}</button>
            </div>
          </div>
        </section>
      ) : null}

      <div className={styles.reviewWorkspace} data-importing={isImporting || undefined}>
        <div className={styles.queuePane}>
          {filteredQueue.length ? filteredQueue.map((photo, index) => {
            const issues = getReviewIssues(photo, copy);
            const active = photo.id === activePhoto?.id;
            return (
              <article key={photo.id} className={styles.queueRow} data-active={active || undefined} data-complete={photo.status === "complete" || undefined} data-error={photo.status === "error" || undefined}>
                {!isImporting ? (
                  <label className={styles.rowCheckbox} onClick={(event) => event.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(photo.id)} onChange={() => setSelectedIds((current) => { const next = new Set(current); if (next.has(photo.id)) next.delete(photo.id); else next.add(photo.id); return next; })} />
                    <span><CheckIcon size={11} /></span>
                  </label>
                ) : null}
                <button type="button" className={styles.rowMain} onClick={() => setActiveId(photo.id)}>
                  <span className={styles.rowNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.rowThumb}><Image src={photo.previewUrl} alt="" fill unoptimized sizes="72px" /></span>
                  <span className={styles.rowCopy}>
                    <strong>{photo.title || photo.file.name}</strong>
                    <small>{photo.file.name} · {formatFileSize(photo.file.size)}</small>
                    {photo.status === "uploading" || photo.status === "compressing" || photo.status === "saving" ? (
                      <span className={styles.rowProgress}><i style={{ width: `${photo.progress}%` }} /></span>
                    ) : null}
                  </span>
                  <QueueStatusBadge photo={photo} issues={issues} copy={copy} />
                </button>
                {!isImporting && photo.status !== "complete" ? (
                  <button type="button" className={styles.removeButton} onClick={() => removePhoto(photo.id)} aria-label={copy.remove}><Trash2Icon size={14} /></button>
                ) : null}
              </article>
            );
          }) : (
            <div className={styles.emptyQueue}><CheckCircle2Icon size={24} /><p>{copy.emptyFilter}</p><button type="button" onClick={() => setNeedsReviewOnly(false)}>{copy.all}</button></div>
          )}
        </div>

        {activePhoto ? (
          <PhotoInspector
            photo={activePhoto}
            copy={copy}
            disabled={isImporting || activePhoto.status === "complete"}
            onChange={(changes) => updatePhoto(activePhoto.id, changes)}
            onPrevious={() => activeIndex > 0 && setActiveId(filteredQueue[activeIndex - 1].id)}
            onNext={() => activeIndex < filteredQueue.length - 1 && setActiveId(filteredQueue[activeIndex + 1].id)}
            hasPrevious={activeIndex > 0}
            hasNext={activeIndex >= 0 && activeIndex < filteredQueue.length - 1}
          />
        ) : null}
      </div>

      {showImportWarning ? (
        <div className={styles.importWarning} role="alert">
          <AlertCircleIcon size={18} />
          <div><strong>{copy.importAnywayTitle}</strong><p>{copy.importAnywayDescription(reviewNoteCount)}</p></div>
          <button type="button" onClick={() => setShowImportWarning(false)}>{copy.backToReview}</button>
          <button type="button" data-primary onClick={() => void runImport(true)}>{copy.importAnyway}</button>
        </div>
      ) : null}

      <footer className={styles.importFooter}>
        <div>
          {!isImporting ? (
            <><button type="button" className={styles.textButton} onClick={requestClose}>{copy.cancel}</button><button type="button" className={styles.textButton} onClick={() => fileInputRef.current?.click()} disabled={queue.length >= MAX_BATCH_SIZE}><ImagePlusIcon size={14} />{copy.addMore}</button></>
          ) : <span>{copy.imported(completedCount, queue.length)}</span>}
        </div>
        <button type="button" className={styles.primaryButton} disabled={isImporting || preparingCount > 0 || invalidPhotos.length > 0} onClick={() => void runImport()}>
          {isImporting ? <LoaderCircleIcon className={styles.spin} size={15} /> : failedCount > 0 ? <RotateCcwIcon size={15} /> : <UploadCloudIcon size={15} />}
          {failedCount > 0 ? copy.retryImport(failedCount) : copy.startImport(queue.length - completedCount)}
        </button>
      </footer>

      <HiddenFileInputs fileInputRef={fileInputRef} folderInputRef={folderInputRef} onChange={handleFiles} />
    </div>
  );
}

function HiddenFileInputs({
  fileInputRef,
  folderInputRef,
  onChange,
}: {
  fileInputRef: React.RefObject<HTMLInputElement>;
  folderInputRef: React.RefObject<HTMLInputElement>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <input ref={fileInputRef} className={styles.hiddenInput} type="file" multiple accept="image/avif,image/gif,image/jpeg,image/png,image/webp" onChange={onChange} />
      <input ref={folderInputRef} className={styles.hiddenInput} type="file" multiple accept="image/avif,image/gif,image/jpeg,image/png,image/webp" onChange={onChange} />
    </>
  );
}

function StepRail({ current, labels }: { current: number; labels: string[] }) {
  return (
    <ol className={styles.stepRail}>
      {labels.map((label, index) => (
        <li key={label} data-active={index === current || undefined} data-complete={index < current || undefined}>
          <span>{index < current ? <CheckIcon size={11} /> : String(index + 1).padStart(2, "0")}</span>
          <strong>{label}</strong>
        </li>
      ))}
    </ol>
  );
}

function QueueStatusBadge({ photo, issues, copy }: { photo: ImportPhoto; issues: string[]; copy: ImportCopy }) {
  if (photo.status === "complete") return <span className={styles.statusBadge} data-complete><CheckCircle2Icon size={12} />{copy.uploadComplete}</span>;
  if (photo.status === "error") return <span className={styles.statusBadge} data-error title={photo.error}><AlertCircleIcon size={12} />{copy.uploadFailed}</span>;
  if (["preparing", "compressing", "uploading", "saving"].includes(photo.status)) return <span className={styles.statusBadge}><LoaderCircleIcon className={styles.spin} size={12} />{photo.status === "preparing" ? copy.processing : `${photo.progress}%`}</span>;
  return issues.length ? <span className={styles.statusBadge} data-review><CircleDashedIcon size={12} />{copy.suggestions(issues.length)}</span> : <span className={styles.statusBadge} data-complete><CheckCircle2Icon size={12} />{copy.ready}</span>;
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`${styles.field} ${className ?? ""}`}><span>{label}</span>{children}</label>;
}

function PhotoInspector({
  photo,
  copy,
  disabled,
  onChange,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: {
  photo: ImportPhoto;
  copy: ImportCopy;
  disabled: boolean;
  onChange: (changes: Partial<ImportPhoto>) => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}) {
  const issues = getReviewIssues(photo, copy);

  return (
    <aside className={styles.inspector}>
      <header className={styles.inspectorHeader}>
        <div><span>{copy.details}</span><strong>{photo.file.name}</strong></div>
        <div><button type="button" onClick={onPrevious} disabled={!hasPrevious} aria-label={copy.previous}><ChevronLeftIcon size={15} /></button><button type="button" onClick={onNext} disabled={!hasNext} aria-label={copy.next}><ChevronRightIcon size={15} /></button></div>
      </header>
      <div className={styles.inspectorScroll}>
        <div className={styles.inspectorPreview}>
          <Image src={photo.previewUrl} alt={photo.title || photo.file.name} fill unoptimized sizes="(max-width: 900px) 100vw, 40vw" />
          <span>{photo.imageInfo ? `${photo.imageInfo.width} × ${photo.imageInfo.height}` : copy.processing}</span>
        </div>

        {photo.error ? <div className={styles.photoError}><AlertCircleIcon size={15} /><span>{photo.error}</span></div> : null}
        {issues.length ? <div className={styles.issueList}>{issues.map((issue) => <span key={issue}><CircleDashedIcon size={11} />{issue}</span>)}</div> : null}

        <div className={styles.inspectorFields}>
          <Field label={copy.title}><input value={photo.title} disabled={disabled} placeholder={copy.titlePlaceholder} onChange={(event) => onChange({ title: event.target.value, generatedTitle: false })} /></Field>
          <Field label={copy.description}><textarea rows={4} value={photo.description} disabled={disabled} placeholder={copy.descriptionPlaceholder} onChange={(event) => onChange({ description: event.target.value, generatedDescription: false })} /></Field>
          <div className={styles.fieldGrid}>
            <Field label={copy.city}><input value={photo.city} disabled={disabled} placeholder={copy.cityPlaceholder} onChange={(event) => onChange({ city: event.target.value })} /></Field>
            <Field label={copy.country}><input value={photo.countryCode} disabled={disabled} maxLength={2} placeholder={copy.countryPlaceholder} onChange={(event) => onChange({ countryCode: event.target.value.toUpperCase() })} /></Field>
          </div>
          <div className={styles.locationHint}><MapPinIcon size={13} /><span>{photo.latitude !== undefined ? copy.gpsRecorded : copy.noGps}</span>{photo.latitude !== undefined ? <code>{photo.latitude.toFixed(5)}, {photo.longitude?.toFixed(5)}</code> : null}</div>
          <Field label={copy.date}><input type="datetime-local" value={photo.dateTimeOriginal} disabled={disabled} onChange={(event) => onChange({ dateTimeOriginal: event.target.value })} /></Field>

          <details className={styles.cameraDetails}>
            <summary><span><FileImageIcon size={14} />{copy.camera}</span><em>{[photo.make, photo.model].filter(Boolean).join(" ") || "—"}</em></summary>
            <div className={styles.cameraFields}>
              <div className={styles.fieldGrid}>
                <Field label={copy.cameraMake}><input value={photo.make} disabled={disabled} onChange={(event) => onChange({ make: event.target.value })} /></Field>
                <Field label={copy.cameraModel}><input value={photo.model} disabled={disabled} onChange={(event) => onChange({ model: event.target.value })} /></Field>
              </div>
              <Field label={copy.lens}><input value={photo.lensModel} disabled={disabled} onChange={(event) => onChange({ lensModel: event.target.value })} /></Field>
              <div className={styles.exposureGrid}>
                <Field label={copy.focalLength}><input type="number" step="any" value={photo.focalLength ?? ""} disabled={disabled} onChange={(event) => onChange({ focalLength: numericValue(event.target.value) })} /></Field>
                <Field label={copy.aperture}><input type="number" step="any" value={photo.fNumber ?? ""} disabled={disabled} onChange={(event) => onChange({ fNumber: numericValue(event.target.value) })} /></Field>
                <Field label={copy.iso}><input type="number" step="1" value={photo.iso ?? ""} disabled={disabled} onChange={(event) => onChange({ iso: numericValue(event.target.value) })} /></Field>
                <Field label={copy.shutter}><input type="number" step="any" value={photo.exposureTime ?? ""} disabled={disabled} onChange={(event) => onChange({ exposureTime: numericValue(event.target.value) })} /></Field>
              </div>
            </div>
          </details>
        </div>
      </div>
    </aside>
  );
}
