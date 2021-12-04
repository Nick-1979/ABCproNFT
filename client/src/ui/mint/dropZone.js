import { DropzoneArea } from "material-ui-dropzone";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";

const useStyles = makeStyles((theme) => ({
  DropzoneText: {
    fontSize: 11,
    fontFamily: [
      "IranSans",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
  },
  preview: {
    width: "100%",
    height: "100%",
    item: "true",
    xs: "12",
    align: "center",
  },
}));

const Dropzone = ({ setSelectedFile }) => {
  const handleFileChange = (files) => {
    files.length ? setSelectedFile(files[0]) : setSelectedFile(null);
  };

  const classes = useStyles();

  return (
    <DropzoneArea
      filesLimit={1}
      clearOnUnmount={false}
      dropzoneParagraphClass={classes.DropzoneText}
      acceptedFiles={["image/*", "video/*", "audio/*"]}
      dropzoneText={
        <Box fontSize={12}>"Click here, or Drag and drop your art's file here!"</Box>
      }
      maxFileSize={20000000} //20M
      onChange={(files) => handleFileChange(files)}
    />
  );
  // }
};

export default Dropzone;
