import {
    ReactElement,
    useMemo,
} from "react";

import "./browserImgPreview.scss";

type propsType = Readonly<{
    img?: Blob
}>;

export default function TicketBrowserImgPreview(props: propsType): ReactElement {
    const { img } = props;

    const blobUrl = useMemo(() => {
        if (img === undefined) return "";
        return URL.createObjectURL(img);
    }, [img]);

    return <div className="imgPreview" data-show={img !== undefined}>
        <img alt="preview" src={blobUrl} />
    </div>
};
