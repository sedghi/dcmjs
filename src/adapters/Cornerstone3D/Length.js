import MeasurementReport from "./MeasurementReport.js";
import TID300Length from "../../utilities/TID300/Length.js";
import CORNERSTONE_3D_TAG from "./cornerstone3DTag";

const LENGTH = "Length";
const FINDING = "121071";
const FINDING_SITE = "G-C0E3";

class Length {
    constructor() {}

    // TODO: this function is required for all Cornerstone Tool Adapters, since it is called by MeasurementReport.
    static getMeasurementData(MeasurementGroup, imageId, imageToWorldCoords) {
        const {
            defaultState,
            NUMGroup,
            SCOORDGroup
        } = MeasurementReport.getSetupMeasurementData(MeasurementGroup);

        const { GraphicData } = SCOORDGroup;
        const worldCoords = [];
        for (let i = 0; i < GraphicData.length; i += 2) {
            const point = imageToWorldCoords(imageId, [
                GraphicData[i],
                GraphicData[i + 1]
            ]);
            worldCoords.push(point);
        }

        const state = {
            ...defaultState,
            length: NUMGroup.MeasuredValueSequence.NumericValue,
            toolType: Length.toolType,
            data: {
                handles: {
                    points: [worldCoords[0], worldCoords[1]],
                    activeHandleIndex: 0,
                    textBox: {
                        hasMoved: false
                    }
                },
                cachedStats: {
                    [`imageId:${imageId}`]: {
                        length: NUMGroup.MeasuredValueSequence.NumericValue
                    }
                }
            }
        };

        return state;
    }

    static getTID300RepresentationArguments(tool, worldToImageCoords) {
        const { data, finding, findingSites, metadata } = tool;
        const { cachedStats, handles } = data;

        const { referencedImageId } = metadata;

        if (!referencedImageId) {
            throw new Error(
                "Length.getTID300RepresentationArguments: referencedImageId is not defined"
            );
        }

        const start = worldToImageCoords(referencedImageId, handles.points[0]);
        const end = worldToImageCoords(referencedImageId, handles.points[1]);

        const point1 = { x: start[0], y: start[1] };
        const point2 = { x: end[0], y: end[1] };
        const distance = cachedStats[Object.keys(cachedStats)[0]].length;

        const trackingIdentifierTextValue = "cornerstone3DTools@^0.1.0:Length";

        return {
            point1,
            point2,
            distance,
            trackingIdentifierTextValue,
            finding,
            findingSites: findingSites || []
        };
    }
}

Length.toolType = LENGTH;
Length.utilityToolType = LENGTH;
Length.TID300Representation = TID300Length;
Length.isValidCornerstoneTrackingIdentifier = TrackingIdentifier => {
    if (!TrackingIdentifier.includes(":")) {
        return false;
    }

    const [cornerstone4Tag, toolType] = TrackingIdentifier.split(":");

    if (cornerstone4Tag !== CORNERSTONE_3D_TAG) {
        return false;
    }

    return toolType === LENGTH;
};

MeasurementReport.registerTool(Length);

export default Length;
